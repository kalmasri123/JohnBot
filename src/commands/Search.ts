import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import {
    CreateMessageStateIfNotExists,
    CreateVoiceStateIfNotExists,
    RequiresSameVoiceChannel,
} from '@util/decorators';
import { cacheYoutubeData, getYoutubeVideo, queueResource, searchYTVideos } from '@util/youtube';
import * as States from '@util/state';
import { handleQueueCommand } from '@util/audio';

const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
class SearchCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'search',
        });
    }
    @CreateMessageStateIfNotExists()
    @CreateVoiceStateIfNotExists()
    @RequiresSameVoiceChannel()
    async executeFunction(message: Message, fn: () => void = null) {
        console.log('Executing');
        super.executeFunction(message, fn);

        //If user is in a voice channel
        //If bot is already in voice channel, check if user is in same channel. If they are, add song to queue.
        try {
            const searchQuery = this.args.slice(1).join(' ');
            const searchResults = await searchYTVideos(searchQuery, 5);
            if (searchResults.length == 0) return message.reply('Videos not found');
            console.log(searchResults);
            const songRequestEmbed = new MessageEmbed()
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
                originalMessage: message,
            };
            States.messageState[this.guild.id][this.message.member.id] = followUpMessage;
            message.reply({ embeds: [songRequestEmbed] });
        } catch (err) {
            return this.message.reply('Unable to search. Please try again.');
        }
    }
}
export default new SearchCommand();
