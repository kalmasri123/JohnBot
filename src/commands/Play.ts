import { Command } from './Command';
import { ChatInputCommandInteraction, Interaction, Message, SlashCommandBuilder } from 'discord.js';
import { CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import playAction from 'actions/play';

class PlayCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'play',
            slashCommand: new SlashCommandBuilder()
                .setName('play')
                .addStringOption((option) => option.setName('name').setDescription("Video name to search for").setRequired(true))
                .setDescription('Play a song')

        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // playAction(this, fn);
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        super.executeCommand(interaction, fn);
        const args = ["",...interaction.options.getString("name").split(" ")]
        playAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new PlayCommand();
