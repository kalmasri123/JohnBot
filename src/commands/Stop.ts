import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { getVoiceConnection } from '@discordjs/voice';
class StopCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'stop',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {

            guildVoiceState.queue.length = 0;
            const resource = (await guildVoiceState.nowPlaying.content).resource as any;
            resource.end();
            guildVoiceState.subscription.player.stop(true);
            guildVoiceState.subscription.unsubscribe()

            guildVoiceState.subscription = null;
            const connection = getVoiceConnection(this.guild.id);
            connection.destroy();
            message.reply('Stopped!');
        } else {
            message.reply("I'm not playing anything");
        }
        return;
    }
}
export default new StopCommand();
