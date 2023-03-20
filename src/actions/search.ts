import { getYoutubeVideo, searchYTVideos } from '@util/youtube';
import { Message, EmbedBuilder } from 'discord.js';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';
import * as States from '@util/state';
import { handleQueueCommand } from '@util/audio';
import {
    ClearIfNoVoiceConnection,
    CreateMessageStateIfNotExists,
    CreateVoiceStateIfNotExists,
    RequiresSameVoiceChannel,
} from '@util/decorators';
const searchAction: SlashAction = async function ({ interaction,args,guild }: SlashActionContext) {
    try {
        const searchQuery = args.slice(1).join(' ');
        const searchResults = await searchYTVideos(searchQuery, 5);
        if (searchResults.length == 0) return interaction.reply('Videos not found');
        console.log(searchResults);
        const songRequestEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`Search Results. Pick a number from ${1} to ${searchResults.length}`)
            .addFields(
                searchResults.map((el, i) => ({
                    name: `${i + 1}. ${el.title}`,
                    value: '\u200B',
                })),
            );
        async function callback(message: Message, fn: () => void = null) {
            const guildId = message.guild.id;
            if (!States.voiceState[guildId]) {
                States.createVoiceState(guildId);
            }
            let selector = parseInt(message.content);
            let audio;
            if (!isNaN(selector) && selector > 0 && selector <= this.data.length) {
                // If its a number, then handle it.
                try {
                    let link = this.data[selector - 1].link;
                    audio = await getYoutubeVideo(link, { seek: 0 }, true);
                    const request: States.SongRequest = {
                        content: audio,
                        requester: message.member,
                        link,
                    };
                    const memberVoiceChannel = message.member.voice.channel;
                    if (!memberVoiceChannel) {
                        message.reply('Please enter a voice channel!');
                        return false;
                    }
                    if (!memberVoiceChannel.joinable) {
                        message.reply(
                            'I do not have sufficient permissions to join this voice channel!',
                        );
                        return false;
                    }
                    handleQueueCommand(message, memberVoiceChannel, request);
                    return true;
                } catch (err) {
                    console.log(err);
                    message.reply('Error playing');
                    return true;
                }
            }
            return false;
        }
        let followUpMessage: States.FollowupCommand = {
            callback,
            data: searchResults,
            originalInteraction: interaction,
            
        };
        States.messageState[guild.id][interaction.member.user.id] = followUpMessage;
        interaction.reply({ embeds: [songRequestEmbed] });
    } catch (err) {
        return interaction.reply('Unable to search. Please try again.');
    }
};
export const actionName = 'search';
export const type = 'action';
let decorated = CreateMessageStateIfNotExists()(searchAction);
decorated = CreateVoiceStateIfNotExists()(decorated);
decorated = RequiresSameVoiceChannel()(decorated);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
