import { getCharacters } from '@util/anilist';
import { getRandomInt } from '@util/helpers';
import {
    Message,
    EmbedBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
} from 'discord.js';
import { Command } from './Command';
import characterAction from 'actions/character';
class CharacterCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'character',
            slashCommand: new SlashCommandBuilder()
                .setName('character')
                .setDescription('Guess the character!'),
            botAction:characterAction
        });
    }
}
export default new CharacterCommand();
