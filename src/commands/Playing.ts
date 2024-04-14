import { Command } from './Command';
import { SlashCommandBuilder } from 'discord.js';
import playingAction from 'actions/playing';

class PlayingCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'playing',
            slashCommand: new SlashCommandBuilder()
                .setName('playing')

                .setDescription('View now playing'),
            botAction: playingAction,
        });
    }
}
export default new PlayingCommand();
