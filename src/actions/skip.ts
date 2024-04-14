import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext, ActionFailure, ActionSuccess, BotAction } from './types';

const skipAction: BotAction = async function ({ guild }: ActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();

        guildVoiceState.subscription.player.stop();
        return ActionSuccess('Skipped!');
    }
    return ActionFailure("I'm not playing anything");
};

export const actionName = 'skip';
export const type = 'action';
let decorated = ClearIfNoVoiceConnection()(CreateVoiceStateIfNotExists()(skipAction));

export default decorated;
