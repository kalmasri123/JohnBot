import { getYoutubeVideo, searchYTVideos } from '@util/youtube';
import { Message, EmbedBuilder, GuildMember } from 'discord.js';
import { BotAction, ActionContext, ActionSuccess, ActionFailure } from './types';
import * as States from '@util/state';
import { handleQueueCommand } from '@util/audio';

import {
    ClearIfNoVoiceConnection,
    CreateMessageStateIfNotExists,
    CreateVoiceStateIfNotExists,
    RequiresSameVoiceChannel,
} from '@util/decorators';
export interface SearchActionContext extends ActionContext {
    searchQuery: string;
    member: GuildMember;
}

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}
const searchAction: BotAction = async function ({
    guild,
    searchQuery,
    member,
}: SearchActionContext) {
    try {
        const searchResults = await searchYTVideos(searchQuery, 5);
        if (searchResults.length == 0) return ActionSuccess('Videos not found');
        console.log(searchResults);
        const songRequestEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle(`Search Results. Pick a number from ${1} to ${searchResults.length}`)
            .addFields(
                searchResults.map((el, i) => ({
                    name: `${i + 1}. ${decodeEntities(el.title)}`,
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
            // originalInteraction: interaction,
        };
        States.messageState[guild.id][member.user.id] = followUpMessage;
        return ActionSuccess(songRequestEmbed);
    } catch (err) {
        console.error(err);
        return ActionFailure('Unable to search. Please try again.');
    }
};
export const actionName = 'search';
export const type = 'action';
let decorated = CreateMessageStateIfNotExists()(searchAction);
decorated = CreateVoiceStateIfNotExists()(decorated);
decorated = RequiresSameVoiceChannel()(decorated);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
