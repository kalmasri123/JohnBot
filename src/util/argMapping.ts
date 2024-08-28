import { ActionContext } from 'actions/types';
import { PlayingActionRow } from './embeds';
import playAction from 'actions/play';
import stopAction from 'actions/stop';
import skipAction from 'actions/skip';

import { BotActionResponse } from 'actions/types';
import { Guild, GuildMember, VoiceChannel } from 'discord.js';
export interface VoiceCommandContext {
    member: GuildMember;
    voiceChannel: VoiceChannel;
    guild: Guild;
}
export async function callValidVoiceAction(
    actionName: string,
    body: string[],
    context: VoiceCommandContext,
): Promise<BotActionResponse> {
    switch (actionName) {
        case 'play':
            return await playAction({ ...context, link: body.join(" ") });
        case 'stop':
            return await stopAction(context);
        case 'skip':
            return await skipAction(context)
    }
}
