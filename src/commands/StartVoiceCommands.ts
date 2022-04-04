import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import startVoiceCommandsAction from 'actions/startvoicecommands';
class StartVoiceCommands extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'startvoicecommands',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        startVoiceCommandsAction(this, fn);
        return;
    }
}
export default new StartVoiceCommands();
