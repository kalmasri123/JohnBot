import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { SongRequest, VoiceState, voiceState } from '@util/state';
import { getYoutubeVideo, queueResource } from '@util/youtube';
import { getVoiceConnection } from '@discordjs/voice';
import { callbackify } from 'util';
class SeekCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'seek',
        });
    }
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const guildVoiceState: VoiceState = voiceState[this.guild.id];
        if (!guildVoiceState.nowPlaying) {
            return message.reply('Nothing is playing!');
        }
        const seconds = parseInt(this.args[1]);
        const voiceConnection = getVoiceConnection(this.guild.id);

        if (isNaN(seconds)) return message.reply('Please enter a valid number!');

        if (seconds < 0 || seconds > (await guildVoiceState.nowPlaying.content).duration)
            return message.reply('Please enter a number within range!');
        console.log();
        const audio = getYoutubeVideo(guildVoiceState.nowPlaying.link, { seek: seconds });
        // const resource = createAudioResource(audio.audio);
        const request: SongRequest = {
            content: audio,
            requester: this.message.member,
            link: guildVoiceState.nowPlaying.link,
        };
        // audio.then(({ audio, title }) => {
        queueResource(request, voiceConnection, fn, true).then(async () => {
            console.log('queued');
            const content = await guildVoiceState.nowPlaying.content;
            (content.resource as any).end();
            console.log('ended');
            guildVoiceState.subscription.player.stop();
            console.log('stopped');
        });
    }
}
export default new SeekCommand();
