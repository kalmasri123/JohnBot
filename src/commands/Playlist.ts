import { Command, ExecuteFunction } from './Command';
import { Message, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import playlistAction from 'actions/playlist';
class PlaylistCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'queue',
            slashCommand: new SlashCommandBuilder()
                .setName('queue')
           
                .setDescription('View the current playlist'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // playlistAction(this, fn);

        // .sert
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {
        super.executeCommand(interaction, fn);
        const args = [''];
        playlistAction({ interaction, guild: interaction.guild, args }, fn);
    }
}
export default new PlaylistCommand();
