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
                .addIntegerOption((option) =>
                    option.setName('seconds').setDescription('Time to seek to').setRequired(true),
                )
                .setDescription('Seek into a specific time'),
            botAction: seekAction,
        });
    }
    override async mapParams(interaction: ChatInputCommandInteraction) {
        const seconds = interaction.options.getInteger('seconds');
        return { seconds, ...Command.getBaseParams(interaction) };
    }

}
export default new SeekCommand();
