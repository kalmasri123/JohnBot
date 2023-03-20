import { Command, ExecuteFunction } from './Command';
import { Message, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import searchAction from 'actions/search';
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
class SearchCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'search',
            slashCommand: new SlashCommandBuilder()
            .setName('search')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('Video name to search for')
                    .setRequired(true),
            )
            .setDescription('Search for a song'),
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        searchAction(this, fn);
    }
    async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {

        super.executeCommand(interaction, fn);
        const args = ["",...interaction.options.getString("name").split(" ")]
        searchAction({interaction,guild:interaction.guild,args}, fn);
    }
}
export default new SearchCommand();
