import { Command, ExecuteFunction } from './Command';
import { Message, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import pauseAction from 'actions/pause';
class PauseCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'pause',
            slashCommand: new SlashCommandBuilder()
                .setName('pause')
                .setDescription('Pause the current audio')
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // pauseAction(this, fn);
        return;
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        super.executeCommand(interaction, fn);
        const args = [""]
        pauseAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new PauseCommand();
