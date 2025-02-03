import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import {
    cacheYoutubeData,
    getMp3File,
    getYoutubeVideo,
    queueResource,
    searchYTVideos,
} from '@util/youtube';
import { Attachment, EmbedBuilder, Guild, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import * as States from '@util/state';
import * as ytpl from 'ytpl';

import { Action, BotAction, ActionContext, ActionFailure, ActionSuccess } from './types';
import {
    ClearIfNoVoiceConnection,
    CreateVoiceStateIfNotExists,
    RequiresSameVoiceChannel,
} from '@util/decorators';
import { startTranscription } from '@util/transcribe';

export interface PlayActionContext extends ActionContext {
    attachment?: Attachment;
    link?: string;
    voiceChannel: VoiceChannel;
    member: GuildMember;
    textChannel?:TextChannel;
}
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

const playAction: BotAction<PlayActionContext> = async function ({
    guild,
    attachment,
    link,
    voiceChannel,
    member:requester,
    textChannel
}: PlayActionContext) {
    if (!link && !attachment) {
        return ActionFailure('No File or youtube video provided');
    }
    if (attachment) {
        let voiceConnection = getVoiceConnection(guild.id);
        if (!voiceChannel) return ActionFailure('Please enter a voice channel!');
        if (!voiceChannel.joinable)
            return ActionFailure(
                'I do not have sufficient permissions to join this voice channel!',
            );

        if (!voiceConnection) {
            voiceConnection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
            });
            startTranscription(guild,voiceChannel,voiceConnection)
        }
        try {
            let audio = await getMp3File(attachment.url, { seek: 0 }, false);
            const request: States.SongRequest = {
                content: audio,
                requester,
                link: attachment.url,
            };
            const p = await queueResource(request, voiceConnection,false,textChannel);
            // Song Request Successful
            // Respond with success interaction
            const content = await request.content;
            const songRequestEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Song Queued')

                .setDescription(
                    `[${content.title}](${attachment.url})\n\nRequester:<@${requester}>`,
                )
                .setThumbnail(content.thumbnail);
            return ActionSuccess(songRequestEmbed);
        } catch (err) {
            return ActionFailure('Unable to get audio');
        }
    }
    if (!linkRegex.test(link)) {
        try {
            const searchQuery = link;
            const searchResults = await searchYTVideos(searchQuery, 5);
            if (searchResults.length == 0) return ActionFailure('Video not found');

            link = searchResults[0]?.link;
        } catch (err) {
            return ActionFailure('Unable to search. Please try again.');
        }
    }
    const isPlaylist = ytpl.validateID(link);
    let links = [];
    let ytplResp;

    if (isPlaylist) {
        ytplResp = await ytpl(link, { limit: Infinity });
        ytplResp.items.map((el) => {
            links.push(el.shortUrl);
        });
        ytplResp.items.map(async (el) => {
            await cacheYoutubeData({
                title: el.title,
                thumbnail: el.thumbnails[0].url,
                lengthSeconds: el.durationSec,
                ytID: el.id,
            });
        });
    } else {
        links = [link];
    }
    // If user is in a voice channel
    // If bot is already in voice channel, check if user is in same channel. If they are, add song to queue.

    let voiceConnection = getVoiceConnection(guild.id);
    if (!voiceChannel) return ActionFailure('Please enter a voice channel!');
    if (!voiceChannel.joinable)
        return ActionFailure('I do not have sufficient permissions to join this voice channel!');

    if (!voiceConnection) {
        voiceConnection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        });
        startTranscription(guild,voiceChannel,voiceConnection)

    }
    for (let el of links){
        let audio;
        try {
            audio = await getYoutubeVideo(el, { seek: 0 }, true);
            // const resource = createAudioResource(audio.audio);
        } catch (err) {
            console.log(err);
            return ActionFailure('Please enter a valid link');
        }
        const request: States.SongRequest = {
            content: audio,
            requester,
            link,
        };
        const p = queueResource(request, voiceConnection,false,textChannel);
        if (!isPlaylist) {
            await p;
            // Song Request Successful
            // Respond with success interaction
            const content = await request.content;
            const songRequestEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('Song Queued')

                .setDescription(`[${content.title}](${link})\n\nRequester:${requester}`)
                .setThumbnail(content.thumbnail);
            return ActionSuccess(songRequestEmbed)
        }
    }
    if (ytplResp) {
        const songRequestEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Playlist Queued')

            .setDescription(`[${ytplResp.title}](${link})\n\nRequester:${requester}`)
            .setThumbnail(ytplResp.thumbnails[0].url);
        return ActionSuccess(songRequestEmbed);
    }
};
export const actionName = 'play';
export const type = 'action';
let decorated = playAction;
decorated = CreateVoiceStateIfNotExists()(decorated);
decorated = RequiresSameVoiceChannel()(decorated);
decorated = ClearIfNoVoiceConnection()(decorated);
export default decorated;
