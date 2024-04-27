import {
    ButtonInteraction,
    CacheType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    Interaction,
    InteractionType,
    Message,
    SlashCommandSubcommandsOnlyBuilder,
    VoiceChannel,
} from 'discord.js';
import { hasUncaughtExceptionCaptureCallback, nextTick } from 'process';
import { SlashCommandBuilder } from 'discord.js';
import { ActionContext, BotAction } from 'actions/types';
import { buildInteractionResponseBody } from '@util/helpers';
export type ExecuteFunction = (message: Message) => void;

interface CommandParameters {
    minArgs: number;
    maxArgs?: number;
    commandName: string;
    notEnoughArgumentsMessage?: string;
    slashCommand?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    botAction: BotAction;
}
export type Repliable = ChatInputCommandInteraction | ButtonInteraction;
export abstract class Command<T extends ActionContext = ActionContext> {
    minArgs: number;
    maxArgs?: number;
    notEnoughArgumentsMessage?: string;
    commandName: string;
    message: Message;
    args: string[];
    guild: Guild;
    slashCommand?: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    botAction: BotAction;
    constructor({
        minArgs,
        maxArgs,
        commandName,
        notEnoughArgumentsMessage = 'Not enough Arguments!',
        slashCommand,
        botAction,
    }: CommandParameters) {
        this.minArgs = minArgs;
        this.maxArgs = maxArgs;
        this.commandName = commandName;
        this.notEnoughArgumentsMessage = notEnoughArgumentsMessage;
        this.slashCommand = slashCommand;
        this.botAction = botAction;
    }
    static getBaseParams(interaction: Repliable): ActionContext {
        const gm = interaction.member as GuildMember;
        return { guild: interaction.guild, };
    }
    executeFunction(message: Message, fn: () => void) {
        fn;
        this.message = message;
        this.args = message.content.split(' ');
        this.guild = message.guild;
        if (this.args.length < this.minArgs) {
            message.reply(this.notEnoughArgumentsMessage);
            fn();
            throw new Error(this.notEnoughArgumentsMessage);
        }
        return;
    }
    protected mapParams?(interaction: Repliable): Promise<T>;
    async executeCommand(interaction: Repliable) {
        await interaction.deferReply();
        console.log(interaction.type);
        const actionContext: T = !this.mapParams
            ? (Command.getBaseParams(interaction) as T)
            : await this.mapParams(interaction);
        try {
            const result = await this.botAction(actionContext);
            console.log(result);
            return await interaction.editReply(buildInteractionResponseBody(result));
        } catch (err) {
            console.error(err);
            await interaction.editReply('An Unknown error has occurred');
            throw err;
        }
        // return;
    }
}
