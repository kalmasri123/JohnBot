import { getVoiceConnection } from "@discordjs/voice";
import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from "@util/decorators";
import { SongRequest, VoiceState, voiceState } from "@util/state";
import { getYoutubeVideo, queueResource } from "@util/youtube";
import { Action, ActionContext, SlashAction, SlashActionContext } from "./types";
import { GuildMember } from "discord.js";

const seekAction:SlashAction = async function({interaction,guild,args}:SlashActionContext,fn){
    const guildVoiceState: VoiceState = voiceState[guild.id];
        if (!guildVoiceState.nowPlaying) {
            return interaction.editReply('Nothing is playing!');
        }
        const seconds = parseInt(args[1]);
        const voiceConnection = getVoiceConnection(guild.id);

        if (isNaN(seconds)) return interaction.editReply('Please enter a valid number!');

        if (seconds < 0 || seconds > (await guildVoiceState.nowPlaying.content).duration)
            return interaction.editReply('Please enter a number within range!');
        console.log();
        const audio = getYoutubeVideo(guildVoiceState.nowPlaying.link, { seek: seconds });
        // const resource = createAudioResource(audio.audio);
        const request: SongRequest = {
            content: audio,
            requester: interaction.member as GuildMember,
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

export const actionName = 'seek';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(seekAction);
decorated = ClearIfNoVoiceConnection()(decorated)

export default decorated;
