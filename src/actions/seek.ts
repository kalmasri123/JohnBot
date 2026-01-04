import { getVoiceConnection } from '@discordjs/voice';
import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { SongRequest, VoiceState, voiceState } from '@util/state';
import { getYoutubeVideo, queueResource } from '@util/youtube';
import { Action, BotAction, ActionContext, ActionFailure, ActionSuccess } from './types';
export interface SeekActionContext extends ActionContext {
    seconds: number;
}
const seekAction: BotAction = async function ({ guild, seconds }: SeekActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (!guildVoiceState.nowPlaying) {
        return ActionFailure('Nothing is playing!');
    }
    const voiceConnection = getVoiceConnection(guild.id);

    if (isNaN(seconds)) return ActionFailure('Please enter a valid number!');

    if (seconds < 0 || seconds > (await guildVoiceState.nowPlaying.content).duration)
        return ActionFailure('Please enter a number within range!');
    const audio = getYoutubeVideo(guildVoiceState.nowPlaying.link, { seek: seconds });
    // const resource = createAudioResource(audio.audio);
    const request: SongRequest = {
        content: audio,
        requester: guildVoiceState.nowPlaying.requester,
        link: guildVoiceState.nowPlaying.link,
    };
    // audio.then(({ audio, title }) => {
    return await queueResource(request, voiceConnection, true).then(async () => {
        const content = await guildVoiceState.nowPlaying.content;
        guildVoiceState.subscription.player.stop(true);
        (content.resource).destroy();

        return ActionSuccess(`Seeked to ${seconds}s`)
    }).catch((err)=>{
        console.error(err)
        return ActionFailure("Failed to seek")
    });
};

export const actionName = 'seek';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(seekAction);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
