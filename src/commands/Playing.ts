import { Command, ExecuteFunction } from './Command';
import { Message, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import playingAction from 'actions/playing';
function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
}
class PlayingCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'playing',
            slashCommand: new SlashCommandBuilder()
                .setName('playing')

                .setDescription('View now playing'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // playingAction(this, fn);
        return;
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {
        await super.executeCommand(interaction, fn);
        const args = [''];
        playingAction({ interaction, guild: interaction.guild, args }, fn);
    }
}
export default new PlayingCommand();
