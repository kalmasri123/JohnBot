import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
class SkipCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'skip',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
            const resource = (await guildVoiceState.nowPlaying.content).resource as any;
            resource.end();

            guildVoiceState.subscription.player.stop();
            message.reply('Skipped!');
        } else {
            message.reply("I'm not playing anything");
        }
        return;
    }
}
export default new SkipCommand();
