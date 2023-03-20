import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { cacheYoutubeData, getYoutubeVideo, queueResource, searchYTVideos } from '@util/youtube';
import { EmbedBuilder, Guild, GuildMember } from 'discord.js';
import * as States from '@util/state';
import * as ytpl from 'ytpl';

import { Action, ActionContext, SlashAction, SlashActionContext } from './types';
import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists,  RequiresSameVoiceChannel } from '@util/decorators';
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

const playAction: SlashAction = async function (
    { interaction, guild, args }: SlashActionContext,
    fn: () => void = null,
) {
    let link = args[1];
    if (!linkRegex.test(link)) {
        try {
            const searchQuery = args.slice(1).join(' ');
            const searchResults = await searchYTVideos(searchQuery, 5);
            if (searchResults.length == 0) return interaction.reply('Video not found');
            console.log(searchResults);

            link = searchResults[0]?.link;
        } catch (err) {
            return interaction.reply('Unable to search. Please try again.');
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
    const memberVoiceChannel = (interaction.member as GuildMember).voice.channel;
    if (!memberVoiceChannel) return interaction.reply('Please enter a voice channel!');
    if (!memberVoiceChannel.joinable)
        return interaction.reply('I do not have sufficient permissions to join this voice channel!');

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
            return interaction.reply('Please enter a valid link');
        }
        const request: States.SongRequest = {
            content: audio,
            requester: interaction.member as GuildMember,
            link,
        };
        const p = queueResource(request, voiceConnection, fn);
        if (!isPlaylist) {
            p.then(async () => {
                // Song Request Successful
                // Respond with success interaction
                const content = await request.content;
                const songRequestEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Song Queued')

                    .setDescription(
                        `[${content.title}](${link})\n\nRequester:<@${interaction.member.user.id}>`,
                    )
                    .setThumbnail(content.thumbnail);
                interaction.reply({ embeds: [songRequestEmbed] });
            }).catch(console.log);
        }
    });
    if (ytplResp) {
        const songRequestEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Playlist Queued')

            .setDescription(`[${ytplResp.title}](${link})\n\nRequester:<@${interaction.member.user.id}>`)
            .setThumbnail(ytplResp.thumbnails[0].url);
        interaction.reply({ embeds: [songRequestEmbed]});
    }
};
export const actionName = 'play';
export const type = 'action';
let decorated = playAction
decorated = CreateVoiceStateIfNotExists()(decorated);
decorated = RequiresSameVoiceChannel()(decorated);
decorated = ClearIfNoVoiceConnection()(decorated)
export default decorated;
