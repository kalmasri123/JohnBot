import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext } from './types';

const removeAction: Action = async function ({ guild, args, message }: ActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    const index = parseInt(args[1]);
    if (guildVoiceState.queue.length == 0)
        return message.reply('YOU CANNOT REMOVE ANYTHING STUPID NOOB');
    if (index > guildVoiceState.queue.length || index < 1)
        return message.reply(
            `ENTER NUMBER BETWEEN 1 AND ${guildVoiceState.queue.length} ❌ STUPID NOOB`,
        );
    guildVoiceState.queue.splice(index - 1, 1);
    message.reply('Successfully removed! ✅');
};
export const actionName = 'remove';
export const type = 'action';
let decorated: Action = CreateVoiceStateIfNotExists()(removeAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
