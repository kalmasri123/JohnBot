import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import removeAction from 'actions/remove';
class RemoveSong extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'remove',
            slashCommand: new SlashCommandBuilder()
            .setName('remove')
            .addStringOption((option) =>
                option
                    .setName('number')
                    .setDescription('Position in the queue to remove')
                    .setRequired(true),
            )
            .setDescription('Remove a song from the queue'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // removeAction(this, fn);
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        super.executeCommand(interaction, fn);
        const args = ["",interaction.options.getString("number")]
        removeAction({interaction,guild:interaction.guild,args}, fn);
    }

}
export default new RemoveSong();
