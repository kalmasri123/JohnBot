import * as yts from 'youtube-search';
import { env } from './env';
import { isFunction, promisify } from 'util';
import { YouTubeSearchOptions } from 'youtube-search';
import * as ytdl from 'ytdl-core';
import { del, get, hGet, hSet, set } from '@util/redis';
import { PassThrough, Readable, Transform } from 'stream';
import { read } from 'fs';
import { writeFileSync } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { SongContent, SongRequest, voiceState } from './state';
import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioResource,
    entersState,
    getVoiceConnection,
    VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { VoiceState } from '@util/state';
import { GuildMember } from 'discord.js';
import { hasUncaughtExceptionCaptureCallback } from 'process';
import { start } from 'repl';
const youtubeSearch = promisify(yts);

export async function searchYTVideos(
    searchCriteria: string,
    maxResults = 10,
): Promise<yts.YouTubeSearchResults[]> {
    const opts: YouTubeSearchOptions = {
        maxResults,
        key: env.YT_API_KEY,
    };
    let results = (await youtubeSearch(searchCriteria, opts))
    console.log(results.map(({kind})=>kind))
    return results.filter(
        ({ kind }) => kind == 'youtube#video',
    );
}
export async function cacheYoutubeData({ title, thumbnail, lengthSeconds, ytID }) {
    try {
        await Promise.all([
            set(`title_${ytID}`, title),
            set(`thumbnail_${ytID}`, thumbnail),
            set(`duration_${ytID}`, lengthSeconds),
        ]);
    } catch (err) {
        console.log({ title, thumbnail, lengthSeconds, ytID });
    }
}
export async function getYoutubeVideo(link: string, { seek }, lazy = false) {
    console.log("LINK",link)
    const ytID = ytdl.getVideoID(link);
    let [title, thumbnail, lengthSeconds] = await Promise.all([
        get(`title_${ytID}`),
        get(`thumbnail_${ytID}`),
        get(`duration_${ytID}`),
    ]);
    if (!title || !thumbnail || !lengthSeconds) {
        const res = (await ytdl.getInfo(link)).videoDetails;
        title = res.title;
        thumbnail = res.thumbnails[0].url;
        lengthSeconds = res.lengthSeconds;
        cacheYoutubeData({ title, thumbnail, lengthSeconds, ytID });
    }
    const content: SongContent = {
        title,
        resource: lazy ? loadStream : loadStream(),
        thumbnail: thumbnail,
        duration: lengthSeconds,
        lazy,
    };
    function loadStream(): Readable {
        const audio = ytdl(link, { filter: 'audioonly', highWaterMark: 1 << 25 }).on(
            'error',
            (err) => console.log(err),
        );
        // const audio = createYTStream(ytInfo,{},);
        let resource: any = audio;
        if (seek > 0) {
            try {
                resource = ffmpeg(audio)
                    .seekInput(seek)
                    .format('mp3')
                    .stream(null)
                    .on('error', (err) => console.log(err));
            } catch (err) {
                console.log(err);
            }
        }
        content.resource = resource;
        return resource;
    }

    return content;
}

export async function queueResource(
    songRequest: SongRequest,

    voiceConnection: VoiceConnection,
    callback: () => void = null,
    front = false,
) {
    const guildVoiceState: VoiceState = voiceState[songRequest.requester.guild.id];
    const queue = guildVoiceState.queue;

    //If length is 0, then resubscribe
    const startQueue = queue.length == 0 && !guildVoiceState.playing;
    console.log(queue.length, !guildVoiceState.playing, startQueue);
    if (startQueue) {
        if (front) {
            queue.unshift(songRequest);
        } else {
            queue.push(songRequest);
        }
        guildVoiceState.playing = true;
        callback();

        const player = new AudioPlayer();
        let request = queue.shift();

        request.content = await request.content;
        let readableStream = request.content.lazy
            ? (request.content.resource as () => Readable)()
            : (request.content.resource as Readable);
        const resource = createAudioResource(readableStream, { inlineVolume: true });
        request.content.audioResource = resource;
        resource.volume.setVolume(guildVoiceState.volume);
        player.play(resource);
        player.on(AudioPlayerStatus.Playing, () => {
            guildVoiceState.nowPlaying = request;
            guildVoiceState.playing = true;
            console.log('NOW PLAYING');
        });
        player.on(AudioPlayerStatus.Buffering, (oldState, newState) => {
            console.log('BUFFERING ');
        });
        player.on(AudioPlayerStatus.Idle, async () => {
            guildVoiceState.nowPlaying = null;
            guildVoiceState.playing = false;
            console.log('IDLING', queue.length);
            if (queue.length > 0) {
                //There is more. Get top of queue.
                request = queue.shift();
                request.content = await request.content;
                let readableStream = request.content.lazy
                    ? (request.content.resource as () => Readable)()
                    : (request.content.resource as Readable);
                const resource = createAudioResource(readableStream, {
                    inlineVolume: true,
                });
                request.content.audioResource = resource;
                resource.volume.setVolume(guildVoiceState.volume);
                player.play(resource);
                return;
            }
            setTimeout(function () {
                const vc = getVoiceConnection(songRequest.requester.guild.id);
                if (queue.length == 0 && !guildVoiceState.playing && vc) {
                    voiceConnection.destroy();
                }
            }, 15000);
        });
        voiceConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
            try {
                await Promise.race([
                    entersState(voiceConnection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                console.log(error);
                guildVoiceState.nowPlaying = null;
                guildVoiceState.playing = null;
                guildVoiceState.queue = [];
                voiceConnection.destroy();
            }
        });
        console.log('SUBSCRIBING');
        guildVoiceState.subscription = voiceConnection.subscribe(player);
    } else {
        if (front) {
            queue.unshift(songRequest);
        } else {
            queue.push(songRequest);
        }
        callback();
    }
}
