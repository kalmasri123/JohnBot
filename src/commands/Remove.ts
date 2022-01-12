import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
class RemoveSong extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'remove',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        const index = parseInt(this.args[1]);
        if (guildVoiceState.queue.length == 0)
            return message.reply('YOU CANNOT REMOVE ANYTHING STUPID NOOB');
        if (index > guildVoiceState.queue.length || index < 1)
            return message.reply(
                `ENTER NUMBER BETWEEN 1 AND ${guildVoiceState.queue.length} ❌ STUPID NOOB`,
            );
        guildVoiceState.queue.splice(index - 1, 1);
        message.reply('Successfully removed! ✅');
    }
}
export default new RemoveSong();
