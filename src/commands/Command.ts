import { Guild, Message } from 'discord.js';
import { hasUncaughtExceptionCaptureCallback } from 'process';
export type ExecuteFunction = (message: Message) => void;

interface CommandParameters {
    minArgs: number;
    maxArgs?: number;
    commandName: string;
    notEnoughArgumentsMessage?: string;
}
export abstract class Command {
    minArgs: number;
    maxArgs?: number;
    notEnoughArgumentsMessage?: string;
    commandName: string;
    message: Message;
    args: string[];
    guild: Guild;
    constructor({
        minArgs,
        maxArgs,
        commandName,
        notEnoughArgumentsMessage = 'Not enough Arguments!',
    }: CommandParameters) {
        this.minArgs = minArgs;
        this.maxArgs = maxArgs;
        this.commandName = commandName;
        this.notEnoughArgumentsMessage = notEnoughArgumentsMessage;
    }
    executeFunction(message: Message, fn: () => void) {
        fn;
        this.message = message;
        this.args = message.content.split(' ');
        this.guild = message.guild;
        if (this.args.length < this.minArgs) {
            message.reply(this.notEnoughArgumentsMessage);
            throw new Error(this.notEnoughArgumentsMessage);
        }
        return;
    }
}
