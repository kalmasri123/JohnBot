import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import playlistAction from 'actions/playlist';
class PlaylistCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'queue',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        playlistAction(this, fn);

        // .sert
    }
}
export default new PlaylistCommand();
