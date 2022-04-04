import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import skipAction from 'actions/skip';
class SkipCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'skip',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        skipAction(this, fn);
    }
}
export default new SkipCommand();
