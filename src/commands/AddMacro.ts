import { Command, ExecuteFunction } from './Command';
import { CacheType, ChatInputCommandInteraction, Guild, Interaction, Message, SlashCommandBuilder } from 'discord.js';
import addMacroAction from "actions/addMacro"

class MacroCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: "addmacro",
            slashCommand: new SlashCommandBuilder()
                .setName("addmacro")
                .addStringOption((option) => option.setName("name").setDescription("Name of the macro").setRequired(true))
                .addStringOption((option) => option.setName("link").setDescription("Link for the macro to play").setRequired(true))
                .setDescription("Creates a command that plays a link")
        })
    }

    async executeFunction(message: Message<boolean>, fn: () => void): Promise<void> {
        super.executeFunction(message, fn);
    }

    async executeCommand(interaction: ChatInputCommandInteraction<CacheType>, fn: () => void): Promise<void> {
        await super.executeCommand(interaction, fn);
        const args = [""]
        addMacroAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new MacroCommand();