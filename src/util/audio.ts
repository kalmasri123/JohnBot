import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { Message, EmbedBuilder, VoiceBasedChannel, VoiceChannel } from 'discord.js';
import { SongRequest } from './state';
import { queueResource } from './youtube';

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
    }

    // audio.then(({ audio, title }) => {
    let p = queueResource(request, voiceConnection);
    p.then(async () => {
        //Song Request Successful
        //Respond with success message
        const content = await request.content;
        const songRequestEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Song Queued')

            .setDescription(
                `[${content.title}](${request.link})\n\nRequester:<@${message.member.id}>`,
            )
            .setThumbnail(content.thumbnail);
        message.reply({ embeds: [songRequestEmbed] });
    }).catch(console.log);
}
