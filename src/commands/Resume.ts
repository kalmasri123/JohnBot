import { Command, ExecuteFunction, Repliable } from './Command';
import {
    Message,
    EmbedBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} from 'discord.js';
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
            botAction:resumeAction
        });
    }
    override async executeCommand(interaction: Repliable): Promise<Message<boolean>> {
        const output = await super.executeCommand(interaction)
        const guildVoiceState: VoiceState = voiceState[interaction.guild.id];
        await guildVoiceState.playStateMessage?.delete()
        guildVoiceState.playStateMessage = output;
        return output;
    }
}
export default new ResumeCommand();
