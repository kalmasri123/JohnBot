import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext } from './types';

const volumeAction: Action = async function ({ message, args }: ActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[message.guild.id];
    const volume = parseInt(args[1]);
    if (isNaN(volume) || volume > 100 || volume < 0) {
        return message.reply(`Incorrect Arguments`);
    }
    if (guildVoiceState.nowPlaying) {
        (await guildVoiceState.nowPlaying.content).audioResource.volume.setVolume(volume / 100);
    }
    guildVoiceState.volume = volume / 100;
    fn();
};
export const type = 'action';
export const actionName = 'volume';
let decorated = CreateVoiceStateIfNotExists()(volumeAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
