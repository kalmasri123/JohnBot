import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import volumeAction from 'actions/volume';
class Volume extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'volume',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        await volumeAction(this, fn);
        return;
        // nowPlaying.
    }
}
export default new Volume();
