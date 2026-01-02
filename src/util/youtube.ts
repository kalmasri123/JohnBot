import * as yts from 'youtube-search';
import { env } from './env';
import { isFunction, promisify } from 'util';
import { YouTubeSearchOptions } from 'youtube-search';
import * as ytdl from '@distube/ytdl-core';
import * as fs from 'fs';
const agent = env.HTTP_PROXY
    ? ytdl.createProxyAgent(
        { uri: env.HTTP_PROXY },
        JSON.parse(fs.readFileSync(env.COOKIES_PATH) as any),
    )
    : ytdl.createAgent(JSON.parse(fs.readFileSync(env.COOKIES_PATH) as any));

import { del, get, hGet, hSet, set } from '@util/redis';
import { PassThrough, Readable, Transform } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { SongContent, SongRequest, voiceCommandState, voiceState } from './state';
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
import { parseBuffer, parseStream } from 'music-metadata';
import { Innertube, Platform, Log } from "youtubei.js"

const fetch = require('node-fetch');

import { VoiceState } from '@util/state';
import { VoiceConnectionDestroyedState } from '@discordjs/voice';
import {
    APIActionRowComponent,
    APIButtonComponent,
    ButtonStyle,
    Message,
    TextChannel,
} from 'discord.js';
import { NowPlayingEmbed, PlayingActionRow } from './embeds';
const player = Innertube.create({ retrieve_player: true, generate_session_locally: true })

Platform.shim.eval = async (data, env) => {
    const properties = []

    if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`)
    }

    if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`)
    }

    const code = `${data.output}\nreturn { ${properties.join(", ")} }`

    return new Function(code)()
}

const youtubeSearch = promisify(yts);
export async function searchYTVideos(
    searchCriteria: string,
    maxResults = 10,
): Promise<yts.YouTubeSearchResults[]> {
    const opts: YouTubeSearchOptions = {
        maxResults,
        key: env.YT_API_KEY,
    };
    let results = await youtubeSearch(searchCriteria, opts);
    console.log(results.map(({ kind }) => kind));
    return results.filter(({ kind }) => kind == 'youtube#video');
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
    console.log('LINK', link);
    // seek = 10;
    const ytID = ytdl.getVideoID(link);
    let [title, thumbnail, lengthSeconds] = await Promise.all([
        get(`title_${ytID}`),
        get(`thumbnail_${ytID}`),
        get(`duration_${ytID}`),
    ]);
    if (!title || !thumbnail || !lengthSeconds) {
        const res = (await ytdl.getInfo(link, { agent })).videoDetails;
        title = res.title;
        thumbnail = res.thumbnails[0].url;
        lengthSeconds = res.lengthSeconds;
        cacheYoutubeData({ title, thumbnail, lengthSeconds, ytID });
    }
    const content: SongContent = {
        title,
        resource: await loadStream(),
        thumbnail: thumbnail,
        duration: lengthSeconds,
        lazy,
    };
    async function loadStream(): Promise<Readable> {
        const resolvedPlayer = await player;
        const readableStream = (await resolvedPlayer.download(ytID)) as any
        const audio = Readable.from(readableStream)


        // const audio = createYTStream(ytInfo,{},);
        let resource: any = audio;
        if (seek > 0) {
            try {
                resource = ffmpeg(audio)
                    .seekInput(seek)
                    .format('mp3')
                    .stream(null)
                    .on('error', (err) => console.log('ERROR THROWN', err));
            } catch (err) {
                console.log('ERROR CAUGHT', err);
            }
        }
        if (lazy) {
            // content.resource = resource;
        }
        return resource;
    }

    return content;
}
export async function getMp3File(link: string, { seek }, lazy = false) {
    console.log('LINK', link);
    // seek = 10;
    console.log((await fetch(link)).body);
    const buffer: Buffer = await (await fetch(link)).buffer();
    const metadata = await parseBuffer(buffer);
    console.log(metadata);
    const content: SongContent = {
        title: 'Custom File',
        resource: Readable.from(buffer),
        thumbnail: 'https://www.computerhope.com/jargon/m/mp3.png',
        duration: metadata.format.duration,
        lazy,
    };

    return content;
}
export async function queueResource(
    songRequest: SongRequest,

    voiceConnection: VoiceConnection,
    front = false,
    textChannel?: TextChannel,
) {
    const guildVoiceState: VoiceState = voiceState[songRequest.requester.guild.id];
    const queue = guildVoiceState.queue;

    //If length is 0, then resubscribe
    const startQueue = queue.length == 0 && !guildVoiceState.playing;
    if (startQueue) {
        if (front) {
            queue.unshift(songRequest);
        } else {
            queue.push(songRequest);
        }
        guildVoiceState.playing = true;

        const player = new AudioPlayer();

        let request = queue.shift();

        request.content = await request.content;
        let readableStream = (request.content.resource as Readable);
        const resource = createAudioResource(readableStream, { inlineVolume: true });
        request.content.audioResource = resource;
        resource.volume.setVolume(guildVoiceState.volume);
        player.play(resource);
        let embedMessage: Message | null = null;

        if (textChannel) {
            embedMessage = await textChannel.send({
                embeds: [
                    NowPlayingEmbed(
                        request.content.title,
                        request.content.thumbnail,
                        request.link,
                        request.requester,
                    ),
                ],
                components: [
                    PlayingActionRow.toJSON() as APIActionRowComponent<APIButtonComponent>,
                ],
            });
            guildVoiceState.playStateMessage = embedMessage;
        }
        player.on("error", (error) => {
            console.log("ERROR OCCURRED", error.name)
        })
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
            // console.log('IDLING', queue.length);
            if (embedMessage?.deletable) await guildVoiceState.playStateMessage?.delete();
            if (queue.length > 0) {
                //There is more. Get top of queue.
                request = queue.shift();

                request.content = await request.content;

                let readableStream = (request.content.resource as Readable);

                const resource = createAudioResource(readableStream);
                request.content.audioResource = resource;
                player.play(resource);

                if (textChannel) {
                    embedMessage = await textChannel.send({
                        embeds: [
                            NowPlayingEmbed(
                                request.content.title,
                                request.content.thumbnail,
                                request.link,
                                request.requester,
                            ),
                        ],
                        components: [
                            PlayingActionRow.toJSON() as APIActionRowComponent<APIButtonComponent>,
                        ],
                    });
                    guildVoiceState.playStateMessage = embedMessage;
                }
                return;
            }
            setTimeout(function () {
                const vc = getVoiceConnection(songRequest.requester.guild.id);
                if (
                    queue.length == 0 &&
                    !guildVoiceState.playing &&
                    vc &&
                    !voiceCommandState[songRequest.requester.guild.id] &&
                    voiceConnection.state.status != VoiceConnectionStatus.Destroyed
                ) {
                    voiceConnection.destroy();
                }
            }, 15000);
        });
        voiceConnection.on('stateChange', (oldState, newState) => {
            if (
                oldState.status === VoiceConnectionStatus.Ready &&
                newState.status === VoiceConnectionStatus.Connecting
            ) {
                voiceConnection.configureNetworking();
            }

            // Seems to eliminate some keepAlive timer that's making the bot auto-pause
            const oldNetworking = Reflect.get(oldState, 'networking');
            const newNetworking = Reflect.get(newState, 'networking');

            const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
                const newUdp = Reflect.get(newNetworkState, 'udp');
                clearInterval(newUdp?.keepAliveInterval);
            };

            oldNetworking?.off('stateChange', networkStateChangeHandler);
            newNetworking?.on('stateChange', networkStateChangeHandler);
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
    }
}
