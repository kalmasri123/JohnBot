import { Command, ExecuteFunction } from './Command';
import {
    Message,
    EmbedBuilder,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    CacheType,
    GuildMember,
    VoiceChannel,
} from 'discord.js';
import searchAction, { SearchActionContext } from 'actions/search';
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
class SearchCommand extends Command<SearchActionContext> {
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
            botAction: searchAction,
        });
    }
    override async mapParams(interaction: ChatInputCommandInteraction) {
        console.log(Command.getBaseParams(interaction));
        const baseParams = Command.getBaseParams(interaction);
        const gm = interaction.member as GuildMember;

        return {
            ...baseParams,
            searchQuery: interaction.options.getString('name'),
            member: interaction.member as GuildMember,
            voiceChannel: gm.voice.channel as VoiceChannel
        };
    }
}
export default new SearchCommand();
