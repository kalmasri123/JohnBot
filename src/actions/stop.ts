import { getVoiceConnection } from '@discordjs/voice';
import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState } from '@util/state';
import { VoiceState } from '@util/state';
import { BotAction, ActionContext, ActionSuccess, ActionFailure } from './types';

const stopAction: BotAction = async function ({ guild }: ActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        guildVoiceState.queue.length = 0;
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();
        guildVoiceState.subscription.player.stop(true);
        guildVoiceState.subscription.unsubscribe();

        guildVoiceState.subscription = null;
        const connection = getVoiceConnection(guild.id);
        // connection.destroy();
        return ActionSuccess('Stopped!');
    } else {
        return ActionFailure("I'm not playing anything");
    }
};
export const type = 'action';
export const actionName = 'stop';
let decorated = CreateVoiceStateIfNotExists()(stopAction);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
