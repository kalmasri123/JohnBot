import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import seekAction, { SeekActionContext } from 'actions/seek';
class SeekCommand extends Command<SeekActionContext> {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'seek',
            slashCommand: new SlashCommandBuilder()
                .setName('seek')
                .addStringOption((option) =>
                    option.setName('time').setDescription('Time to seek to').setRequired(true),
                )
                .setDescription('Seek into a specific time'),
            botAction: seekAction,
        });
    }

}
export default new SeekCommand();
