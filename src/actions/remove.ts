import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';

const removeAction: SlashAction = async function ({ guild, args, interaction }: SlashActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    const index = parseInt(args[1]);
    if (guildVoiceState.queue.length == 0)
        return interaction.editReply('YOU CANNOT REMOVE ANYTHING STUPID NOOB');
    if (index > guildVoiceState.queue.length || index < 1)
        return interaction.editReply(
            `ENTER NUMBER BETWEEN 1 AND ${guildVoiceState.queue.length} ❌ STUPID NOOB`,
        );
    guildVoiceState.queue.splice(index - 1, 1);
    interaction.editReply('Successfully removed! ✅');
};
export const actionName = 'remove';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(removeAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
