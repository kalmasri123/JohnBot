import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import seekAction from 'actions/seek';
class SeekCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'seek',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        seekAction(this, fn);
    }
}
export default new SeekCommand();
