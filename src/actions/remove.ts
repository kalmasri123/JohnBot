import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { BotAction, ActionContext, ActionFailure } from './types';

export interface RemoveActionContext extends ActionContext{
    index:number;
}
const removeAction: BotAction = async function ({ guild,index}: RemoveActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length == 0)
        return ActionFailure('YOU CANNOT REMOVE ANYTHING STUPID NOOB');
    if (index > guildVoiceState.queue.length || index < 1)
        return ActionFailure(
            `ENTER NUMBER BETWEEN 1 AND ${guildVoiceState.queue.length} ❌ STUPID NOOB`,
        );
    guildVoiceState.queue.splice(index - 1, 1);
    return ActionFailure('Successfully removed! ✅');
};
export const actionName = 'remove';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(removeAction);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
