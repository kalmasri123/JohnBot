import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { voiceState, VoiceState } from '@util/state';
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
class Volume extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'volume',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.message.guild.id];
        const volume = parseInt(this.args[1]);
        if (isNaN(volume) || volume > 100 || volume < 0) {
            return message.reply(`Incorrect Arguments`);
        }
        if (guildVoiceState.nowPlaying) {
            (await guildVoiceState.nowPlaying.content).audioResource.volume.setVolume(volume / 100);
        }
        guildVoiceState.volume = volume / 100;
        fn();
        // nowPlaying.
    }
}
export default new Volume();
