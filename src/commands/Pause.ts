import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import pauseAction from 'actions/pause';
class PauseCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'pause',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        pauseAction(this, fn);
        return;
    }
}
export default new PauseCommand();
