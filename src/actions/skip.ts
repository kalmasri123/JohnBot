import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext } from './types';

const skipAction: Action = async function ({ guild, message }: ActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();

        guildVoiceState.subscription.player.stop();
        message.reply('Skipped!');
    } else {
        message.reply("I'm not playing anything");
    }
    return;
};

export const actionName = 'skip';
export const type = 'action';
let decorated: Action = CreateVoiceStateIfNotExists()(skipAction);

export default decorated;
