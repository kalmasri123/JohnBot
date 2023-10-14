import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import skipAction from 'actions/skip';
class SkipCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'skip',
            slashCommand: new SlashCommandBuilder()
            .setName('skip')

            .setDescription('Skip the currently playing audio')
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        // skipAction(this, fn);
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        await super.executeCommand(interaction, fn);
        const args = [""]
        skipAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new SkipCommand();
