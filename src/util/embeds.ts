import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
export const PlayingActionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('skip').setLabel('Skip').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('pause').setLabel('Pause').setStyle(ButtonStyle.Danger),
);
export const PausedActionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('skip').setLabel('Skip').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('stop').setLabel('Stop').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('resume').setLabel('Resume').setStyle(ButtonStyle.Success),
);

export const NowPlayingEmbed = (title, thumbnail, url, requester) =>
    new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Now Playing')
        .setDescription(`[${title}](${url})\n\nRequester:<${requester}>`)
        .setThumbnail(thumbnail);
