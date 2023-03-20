import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import volumeAction from 'actions/volume';
class Volume extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'volume',
            slashCommand: new SlashCommandBuilder()
                .setName('volume')
                .addStringOption((option) =>
                    option.setName('volume').setDescription('Volume to adjust to').setRequired(true),
                )
                .setDescription('Adjust the volume'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // await volumeAction(this, fn);
        return;
        // nowPlaying.
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {
        super.executeCommand(interaction, fn);
        const args = ['',interaction.options.getString("volume").split(" ")[0]];
        await volumeAction({ interaction, guild: interaction.guild, args }, fn);
    }
}
export default new Volume();
