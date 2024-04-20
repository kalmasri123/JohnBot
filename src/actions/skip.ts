import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import { voiceState, VoiceState } from '@util/state';
import { Action, ActionContext, ActionFailure, ActionSuccess, BotAction } from './types';
import { GuildMember, VoiceChannel } from 'discord.js';
export interface SkipActionContext extends ActionContext {
    member: GuildMember;
    voiceChannel:VoiceChannel;
}
const skipAction: BotAction = async function ({ guild,member }: SkipActionContext) {
    const guildVoiceState: VoiceState = voiceState[guild.id];
    if (guildVoiceState.queue.length > 0 || guildVoiceState.playing) {
        const resource = (await guildVoiceState.nowPlaying.content).resource as any;
        resource.end();

        guildVoiceState.subscription.player.stop();
        return ActionSuccess(`Skipped by ${member}`);
    }
    return ActionFailure("I'm not playing anything");
};

export const actionName = 'skip';
export const type = 'action';
let decorated = ClearIfNoVoiceConnection()(CreateVoiceStateIfNotExists()(skipAction));
decorated = RequiresSameVoiceChannel()(decorated);

export default decorated;
