import { Guild, Message } from "discord.js";

export interface ActionContext {
    args: string[];
    message:Message,
    guild:Guild,
    
}
