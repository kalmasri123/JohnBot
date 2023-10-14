import { Command, ExecuteFunction } from './Command';
import { Message, EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import resumeAction from 'actions/resume';
function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
}
class ResumeCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'resume',
            slashCommand: new SlashCommandBuilder()
                .setName('resume')
                .setDescription('Resume audio'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        // super.executeFunction(message, fn);
        // resumeAction(this, fn);
        return;
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        await super.executeCommand(interaction, fn);
        const args = [""]
        resumeAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new ResumeCommand();
