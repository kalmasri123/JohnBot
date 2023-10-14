import { getVoiceConnection } from '@discordjs/voice';
import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState } from '@util/state';
import { VoiceState } from '@util/state';
import { ActionContext, Action, SlashAction, SlashActionContext } from './types';

const stopAction: SlashAction = async function ({ guild, interaction }: SlashActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        guildVoiceState.queue.length = 0;
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();
        guildVoiceState.subscription.player.stop(true);
        guildVoiceState.subscription.unsubscribe();

        guildVoiceState.subscription = null;
        const connection = getVoiceConnection(guild.id);
        connection.destroy();
        interaction.editReply('Stopped!');
    } else {
        interaction.editReply("I'm not playing anything");
    }
};
export const type = 'action';
export const actionName = 'stop';
let decorated = CreateVoiceStateIfNotExists()(stopAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
