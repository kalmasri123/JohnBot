import { Command } from './Command';
import {
    SlashCommandBuilder,
} from 'discord.js';
import playlistAction from 'actions/playlist';
class PlaylistCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'queue',
            slashCommand: new SlashCommandBuilder()
                .setName('queue')

                .setDescription('View the current playlist'),
            botAction: playlistAction,
        });
    }
}
export default new PlaylistCommand();
