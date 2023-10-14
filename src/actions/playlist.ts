import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { voiceState } from '@util/state';
import { VoiceState } from '@util/state';
import { EmbedBuilder } from 'discord.js';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';

const playlistAction: SlashAction = async function ({ interaction, guild }: SlashActionContext, fn) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    const queue = (await Promise.all(guildVoiceState.queue.map((el) => el.content))).slice(0, 20);
    const nowPlaying = await guildVoiceState.nowPlaying?.content;
    if (queue.length == 0 && !nowPlaying) return interaction.editReply('Nothing is playing!');
    const playlistEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Playlist')
        .addFields([
            { name: `Now Playing : ${nowPlaying.title}`, value: '\u200B' },
            ...queue.map((el, i) => ({ name: `${i + 1} : ${el.title}`, value: '\u200B' })),
        ]);
    interaction.editReply({ embeds: [playlistEmbed] });
};
export const actionName = 'playlist';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(playlistAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
