import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
}
class PlayingCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'playing',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        if (!guildVoiceState.playing) return message.reply('Nothing is playing!');
        const content = await guildVoiceState.nowPlaying.content;
        const resource = content.audioResource;
        const durationSeconds = Math.round(resource.playbackDuration / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        const durationRemaining = Math.floor(durationSeconds % 60);
        const lengthMinutes = Math.floor(content.duration / 60);

        const lengthSeconds = Math.round(content.duration % 60);

        const songRequestEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Now Playing')

            .setDescription(
                `[${content.title}](${guildVoiceState.nowPlaying.link})\n\`\`\`${pad(
                    durationMinutes,
                    2,
                )}:${pad(durationRemaining, 2)} - ${pad(lengthMinutes, 2)}:${pad(
                    lengthSeconds,
                    2,
                )}\`\`\`\nRequester:<@${this.message.member.id}>`,
            )
            .setThumbnail(content.thumbnail);
        this.message.reply({ embeds: [songRequestEmbed] });
        return;
    }
}
export default new PlayingCommand();
