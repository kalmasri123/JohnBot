import { Command } from './Command';
import {
    ChatInputCommandInteraction,
    GuildMember,
    Interaction,
    Message,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    VoiceChannel,
} from 'discord.js';
import { CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import playAction, { PlayActionContext } from 'actions/play';
import { ValidMacros } from '@util/macros';
import { MacroAddActionContext, macroAddAction } from 'actions/macroadd';

class MacroAddCommand extends Command<MacroAddActionContext> {
    constructor() {
        let slashCommand:SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder = new SlashCommandBuilder().setName('macroadd').setDescription("Create a macro");
        
        ValidMacros.forEach((macro) => {
            slashCommand = (slashCommand).addSubcommand((subcommand) => {
                let subCommand = subcommand.setName(macro.actionName).setDescription("Command to run").addStringOption((option) =>
                    option.setName('macroname').setDescription('Set the macro name').setRequired(true)
                );
                Object.keys(macro.argMap).forEach(
                    (arg) =>{
                        console.log(arg)
                        subCommand = subCommand.addStringOption((option) => option.setName(arg).setDescription("parameter").setRequired(true))
                    });
                return subCommand
            })
        });
        super({
            minArgs: 2,
            commandName: 'macroadd',
            slashCommand: slashCommand,
            botAction: macroAddAction,
        });
    }
    override async mapParams(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        console.log(interaction.options,interaction.options.getSubcommand(),interaction.options.getString('link'))
        const macro = ValidMacros.find(m=>m.actionName==interaction.options.getSubcommand())
        let args = {}
        Object.keys(macro.argMap).forEach(s=>{
            args[s] = interaction.options.getString(s)
        })
        return {
            ...Command.getBaseParams(interaction),
            macroName:interaction.options.getString('macroname'),
            args,
            action:interaction.options.getSubcommand()
        };
    }
}
export default new MacroAddCommand();
