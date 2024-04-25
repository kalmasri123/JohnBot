import { EmbedBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Guild,
    Message,
    VoiceChannel,
} from 'discord.js';

// export interface ActionContext {
//     args: string[];
//     message:Message,
//     guild:Guild,

// }
export interface ActionContext {
    guild: Guild;
    voiceChannel: VoiceChannel;
}
type ActionMessageResolvable =
    | string
    | EmbedBuilder
    | { embeds: EmbedBuilder[]; components: ActionRowBuilder[] };
export interface BotActionResponse {
    success: boolean;
    message?: ActionMessageResolvable;
}
export const ActionSuccess = (message: ActionMessageResolvable): BotActionResponse => ({
    success: true,
    message,
});
export const ActionFailure = (message: ActionMessageResolvable): BotActionResponse => ({
    success: false,
    message,
});

export type Action = (context: ActionContext, fn: () => void) => void;
export type BotAction<T extends ActionContext = ActionContext> = (context: T) => Promise<BotActionResponse>;
