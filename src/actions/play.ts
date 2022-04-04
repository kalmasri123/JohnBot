import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { cacheYoutubeData, getYoutubeVideo, queueResource, searchYTVideos } from '@util/youtube';
import { MessageEmbed } from 'discord.js';
import * as States from '@util/state';
import * as ytpl from 'ytpl';

import { ActionContext } from './types';
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;


export default async function playAction(
    { message, guild, args }: ActionContext,
    fn: () => void = null,
) {
    let link = args[1];
    if (!linkRegex.test(link)) {
        try {
            const searchQuery = args.slice(1).join(' ');
            const searchResults = await searchYTVideos(searchQuery, 5);
            if (searchResults.length == 0) return message.reply('Video not found');
            console.log(searchResults);

            link = searchResults[0]?.link;
        } catch (err) {
            return message.reply('Unable to search. Please try again.');
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
    //If user is in a voice channel
    //If bot is already in voice channel, check if user is in same channel. If they are, add song to queue.

    let voiceConnection = getVoiceConnection(guild.id);
    const memberVoiceChannel = message.member.voice.channel;
    if (!memberVoiceChannel) return message.reply('Please enter a voice channel!');
    if (!memberVoiceChannel.joinable)
        return message.reply('I do not have sufficient permissions to join this voice channel!');

    if (!voiceConnection) {
        voiceConnection = await joinVoiceChannel({
            channelId: memberVoiceChannel.id,
            guildId: guild.id,
            adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator as any,
        });
    }
    links.map(async (el) => {
        let audio;
        try {
            audio = await getYoutubeVideo(el, { seek: 0 }, true);
            // const resource = createAudioResource(audio.audio);
        } catch (err) {
            console.log(err);
            return message.reply('Please enter a valid link');
        }
        const request: States.SongRequest = {
            content: audio,
            requester: message.member,
            link,
        };
        let p = queueResource(request, voiceConnection, fn);
        if (!isPlaylist) {
            p.then(async () => {
                //Song Request Successful
                //Respond with success message
                const content = await request.content;
                const songRequestEmbed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('Song Queued')

                    .setDescription(
                        `[${content.title}](${link})\n\nRequester:<@${message.member.id}>`,
                    )
                    .setThumbnail(content.thumbnail);
                message.reply({ embeds: [songRequestEmbed] });
            }).catch(console.log);
        }
    });
    if (ytplResp) {
        const songRequestEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Playlist Queued')

            .setDescription(`[${ytplResp.title}](${link})\n\nRequester:<@${message.member.id}>`)
            .setThumbnail(ytplResp.thumbnails[0].url);
        message.reply({ embeds: [songRequestEmbed] });
    }
}
