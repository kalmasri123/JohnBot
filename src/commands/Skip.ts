import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import skipAction from 'actions/skip';
class SkipCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'skip',
            slashCommand: new SlashCommandBuilder()
                .setName('skip')

                .setDescription('Skip the currently playing audio'),
            botAction: skipAction,
        });
    }
}
export default new SkipCommand();
