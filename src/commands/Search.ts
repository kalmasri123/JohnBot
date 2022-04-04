import { Command, ExecuteFunction } from './Command';
import { Message, MessageEmbed } from 'discord.js';
import searchAction from 'actions/search';
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;
class SearchCommand extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'search',
        });
    }
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        searchAction(this, fn);
    }
}
export default new SearchCommand();
