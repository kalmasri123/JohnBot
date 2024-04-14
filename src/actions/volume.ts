import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, BotAction, ActionContext, ActionFailure, ActionSuccess } from './types';

export interface VolumeActionContext extends ActionContext {
    volume: number;
}
const volumeAction: BotAction = async function ({ guild, volume }: VolumeActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    // const volume = parseInt(args[1]);
    if (isNaN(volume) || volume > 100 || volume < 0) {
        return ActionFailure(`Incorrect Arguments`);
    }
    if (guildVoiceState.nowPlaying) {
        (await guildVoiceState.nowPlaying.content).audioResource.volume.setVolume(volume / 100);
    }
    guildVoiceState.volume = volume / 100;
    ActionSuccess('Volume changed');
};
export const type = 'action';
export const actionName = 'volume';
let decorated = CreateVoiceStateIfNotExists()(volumeAction);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
