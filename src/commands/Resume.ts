import { Command, ExecuteFunction } from './Command';
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
}
export default new ResumeCommand();
