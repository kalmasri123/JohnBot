import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { EmbedBuilder } from 'discord.js';
import { Action, BotAction, ActionContext, ActionFailure, ActionSuccess } from './types';
import { PausedActionRow } from '@util/embeds';
function pad(num, size) {
    var s = '000000000' + num;
    return s.substr(s.length - size);
}
const pauseAction: BotAction = async function ({ guild }: ActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (!guildVoiceState.nowPlaying) return ActionFailure('Not playing anything!');
    if (guildVoiceState.paused) return ActionFailure('Already paused!');
    const content = await guildVoiceState.nowPlaying.content;
    const resource = content.audioResource;
    const durationSeconds = Math.round(resource.playbackDuration / 1000);
    const durationMinutes = Math.floor(durationSeconds / 60);
    const durationRemaining = Math.floor(durationSeconds % 60);
    const lengthMinutes = Math.floor(content.duration / 60);

    const lengthSeconds = Math.round(content.duration % 60);
    guildVoiceState.subscription.player.pause();

    const pausedEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Paused')

        .setDescription(
            `[${content.title}](${guildVoiceState.nowPlaying.link})\n\`\`\`${pad(
                durationMinutes,
                2,
            )}:${pad(durationRemaining, 2)} - ${pad(lengthMinutes, 2)}:${pad(
                lengthSeconds,
                2,
            )}\`\`\`\nRequester:<@${guildVoiceState.nowPlaying.requester}>`,
        )
        .setThumbnail(content.thumbnail);
    guildVoiceState.paused = true;
    return ActionSuccess({ embeds: [pausedEmbed], components: [PausedActionRow] });
};
export const actionName = 'pause';
export const type = 'action';
let decorated = ClearIfNoVoiceConnection()(CreateVoiceStateIfNotExists()(pauseAction));
export default decorated;
