import { CacheType, ChatInputCommandInteraction, Guild, Interaction, Message } from 'discord.js';
import { hasUncaughtExceptionCaptureCallback, nextTick } from 'process';
import { SlashCommandBuilder } from 'discord.js';
export type ExecuteFunction = (message: Message) => void;

interface CommandParameters {
    minArgs: number;
    maxArgs?: number;
    commandName: string;
    notEnoughArgumentsMessage?: string;
    slashCommand?: SlashCommandBuilder;
}
export abstract class Command {
    minArgs: number;
    maxArgs?: number;
    notEnoughArgumentsMessage?: string;
    commandName: string;
    message: Message;
    args: string[];
    guild: Guild;
    slashCommand?: SlashCommandBuilder;
    constructor({
        minArgs,
        maxArgs,
        commandName,
        notEnoughArgumentsMessage = 'Not enough Arguments!',
        slashCommand,
    }: CommandParameters) {
        this.minArgs = minArgs;
        this.maxArgs = maxArgs;
        this.commandName = commandName;
        this.notEnoughArgumentsMessage = notEnoughArgumentsMessage;
        this.slashCommand = slashCommand;
    }
    executeFunction(message: Message, fn: () => void) {
        fn;
        this.message = message;
        this.args = message.content.split(' ');
        this.guild = message.guild;
        if (this.args.length < this.minArgs) {
            message.reply(this.notEnoughArgumentsMessage);
            fn()
            throw new Error(this.notEnoughArgumentsMessage);
        }
        return;
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void) {
        fn;
        // console.log(interaction.options.data)
        // this.message = message;
        // await interaction.deferReply()
        // this.args = interaction.options.data;
        // console.log
        // this.guild = message.guild;
        // if (this.args.length < this.minArgs) {
        //     message.reply(this.notEnoughArgumentsMessage);
        //     throw new Error(this.notEnoughArgumentsMessage);
        // }
        return;
    }
}
