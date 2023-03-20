import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { getVoiceConnection } from '@discordjs/voice';
import stopAction from 'actions/stop';
class StopCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'stop',
            slashCommand: new SlashCommandBuilder()
            .setName('stop')

            .setDescription('Leave the voice channel')
        });
    }
    // @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // stopAction(this)
        return;
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        super.executeCommand(interaction, fn);
        const args = [""]
        stopAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new StopCommand();
