import { getCharacters } from '@util/anilist';
import { getRandomInt } from '@util/helpers';
import { Message, MessageEmbed } from 'discord.js';
import { Command } from './Command';
import { stringSimilarity } from 'string-similarity-js';
import { deleteMessageState, messageState } from '@util/state';
import { CreateMessageStateIfNotExists } from '@util/decorators';
import characterAction from 'actions/character';
class SearchCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'character',
        });
    }
    async executeFunction(message: Message<boolean>, fn: () => void): Promise<void> {
        super.executeFunction(message, fn);
        characterAction(this, fn);
    }
}
export default new SearchCommand();
