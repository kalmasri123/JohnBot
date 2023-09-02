import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import seekAction from 'actions/seek';
class SeekCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'seek',
            slashCommand: new SlashCommandBuilder()
            .setName('seek')
            .addStringOption((option) =>
                option
                    .setName('time')
                    .setDescription('Time to seek to')
                    .setRequired(true),
            )
            .setDescription('Seek into a specific time'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // seekAction(this, fn);
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        await super.executeCommand(interaction, fn);
        const args = ["",interaction.options.getString("time")]
        seekAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new SeekCommand();
