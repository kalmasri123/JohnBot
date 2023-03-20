import { ChatInputCommandInteraction, Guild, Message } from "discord.js";

export interface ActionContext {
    args: string[];
    message:Message,
    guild:Guild,
    
}
export interface SlashActionContext {
    args: string[];
    interaction:ChatInputCommandInteraction,
    guild:Guild,
    
}
export type Action = (context:ActionContext, fn: () => void) => void;
export type SlashAction = (context:SlashActionContext, fn: () => void) => void;
