import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
class PlaylistCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'queue',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        const queue = (await Promise.all(guildVoiceState.queue.map((el) => el.content))).slice(0, 20);
        const nowPlaying = await guildVoiceState.nowPlaying?.content;
        if (queue.length == 0 && !nowPlaying) return message.reply('Nothing is playing!');
        const playlistEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Playlist')
            .addFields([
                { name: `Now Playing : ${nowPlaying.title}`, value: '\u200B' },
                ...queue.map((el, i) => ({ name: `${i + 1} : ${el.title}`, value: '\u200B' })),
            ]);
        message.reply({ embeds: [playlistEmbed] });

        // .sert
    }
}
export default new PlaylistCommand();
