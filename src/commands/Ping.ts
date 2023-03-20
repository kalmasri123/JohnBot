import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
class PingCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'ping',
        });
    }
    executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // this.message.reply('PONG');
    }
    
}
export default new PingCommand();
