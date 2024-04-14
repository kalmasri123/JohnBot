import { Command } from './Command';
import { Message, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import pauseAction from 'actions/pause';
class PauseCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'pause',
            slashCommand: new SlashCommandBuilder()
                .setName('pause')
                .setDescription('Pause the current audio'),
            botAction: pauseAction,
        });
    }
}
export default new PauseCommand();
