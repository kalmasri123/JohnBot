import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import { getVoiceConnection } from '@discordjs/voice';
import stopAction from 'actions/stop';
class StopCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'stop',
            slashCommand: new SlashCommandBuilder()
                .setName('stop')

                .setDescription('Leave the voice channel'),
            botAction: stopAction,
        });
    }
}
export default new StopCommand();
