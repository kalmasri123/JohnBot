import { Command } from './Command';
import { Message } from 'discord.js';
import { CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import playAction from 'actions/play';

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
        playAction(this, fn);
    }
}
export default new PlayCommand();
