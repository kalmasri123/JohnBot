import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Message, EmbedBuilder, VoiceBasedChannel, VoiceChannel, TextChannel } from 'discord.js';
import { SongRequest } from './state';
import { queueResource } from './youtube';
import { startTranscription } from './transcribe';

export async function handleQueueCommand(
    message: Message,
    voiceChannel: VoiceBasedChannel,
    request: SongRequest,
) {
    let voiceConnection = getVoiceConnection(message.guild.id);

    if (!voiceConnection) {
        voiceConnection = await joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
        });
        startTranscription(message.guild, voiceChannel as VoiceChannel, voiceConnection);
    }

    // audio.then(({ audio, title }) => {
    const content = await request.content;

    const songRequestEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Song Queued')

        .setDescription(`[${content.title}](${request.link})\n\nRequester:<@${message.member.id}>`)
        .setThumbnail(content.thumbnail);

    await message.reply({ embeds: [songRequestEmbed] });

    let p = queueResource(request, voiceConnection, false, message.channel as TextChannel);
}
