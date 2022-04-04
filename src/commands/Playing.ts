import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
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
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        playingAction(this, fn);
        return;
    }
}
export default new PlayingCommand();
