import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';

const volumeAction: SlashAction = async function ({ interaction, args }: SlashActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[interaction.guild.id];
    const volume = parseInt(args[1]);
    if (isNaN(volume) || volume > 100 || volume < 0) {
        return interaction.editReply(`Incorrect Arguments`);
    }
    if (guildVoiceState.nowPlaying) {
        (await guildVoiceState.nowPlaying.content).audioResource.volume.setVolume(volume / 100);
    }
    guildVoiceState.volume = volume / 100;
    interaction.editReply("Volume changed")
    fn();
};
export const type = 'action';
export const actionName = 'volume';
let decorated = CreateVoiceStateIfNotExists()(volumeAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
