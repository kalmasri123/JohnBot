import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
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
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        resumeAction(this, fn);
        return;
    }
}
export default new ResumeCommand();
