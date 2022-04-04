import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { getVoiceConnection } from '@discordjs/voice';
import stopAction from 'actions/stop';
class StopCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'stop',
        });
    }
    // @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        stopAction(this)
        return;
    }
}
export default new StopCommand();
