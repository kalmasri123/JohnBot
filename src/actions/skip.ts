import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';

const skipAction: SlashAction = async function ({ guild, interaction }: SlashActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();

        guildVoiceState.subscription.player.stop();
        interaction.editReply('Skipped!');
    } else {
        interaction.editReply("I'm not playing anything");
    }
    return;
};

export const actionName = 'skip';
export const type = 'action';
let decorated = ClearIfNoVoiceConnection()(CreateVoiceStateIfNotExists()(skipAction));

export default decorated;
