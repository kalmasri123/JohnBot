import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import * as ytdl from 'ytdl-core';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    getVoiceConnection,
    joinVoiceChannel,
    VoiceConnection,
} from '@discordjs/voice';
import { CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import { getYoutubeVideo, queueResource, searchYTVideos } from '@util/youtube';
import { voiceState as vs, VoiceState } from '@util/state';
import * as States from '@util/state';

const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
class PlayCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'play',
        });
    }
    @CreateVoiceStateIfNotExists()
    @RequiresSameVoiceChannel()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        let link = this.args[1];
        if (!linkRegex.test(link)) {
            const searchQuery = this.args.slice(1).join(' ');
            const searchResults = await searchYTVideos(searchQuery, 1);
            link = searchResults[0]?.link;
            // return this.message.reply('Please enter a link!');
        }
        //If user is in a voice channel
        //If bot is already in voice channel, check if user is in same channel. If they are, add song to queue.
        let voiceConnection = getVoiceConnection(this.guild.id);
        const memberVoiceChannel = this.message.member.voice.channel;
        if (!memberVoiceChannel) return this.message.reply('Please enter a voice channel!');
        if (!memberVoiceChannel.joinable)
            return this.message.reply(
                'I do not have sufficient permissions to join this voice channel!',
            );

        if (!voiceConnection) {
            voiceConnection = await joinVoiceChannel({
                channelId: memberVoiceChannel.id,
                guildId: this.guild.id,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator as any,
            });
        }
        let audio;
        try {
            audio = await getYoutubeVideo(link, { seek: 0 });
            // const resource = createAudioResource(audio.audio);
        } catch (err) {
            return message.reply('Please enter a valid link');
        }
        const request: States.SongRequest = {
            content: audio,
            requester: this.message.member,
            link,
        };
        // audio.then(({ audio, title }) => {
        queueResource(request, voiceConnection, fn)
            .then(async () => {
                //Song Request Successful
                //Respond with success message
                const content = await request.content;
                const songRequestEmbed = new MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('Song Queued')

                    .setDescription(
                        `[${content.title}](${link})\n\nRequester:<@${this.message.member.id}>`,
                    )
                    .setThumbnail(content.thumbnail);
                this.message.reply({ embeds: [songRequestEmbed] });
            })
            .catch(console.log);
    }
}
export default new PlayCommand();
