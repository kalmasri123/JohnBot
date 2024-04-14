import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import removeAction from 'actions/remove';
class RemoveSong<RemoveActionContext> extends Command {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'remove',
            slashCommand: new SlashCommandBuilder()
                .setName('remove')
                .addStringOption((option) =>
                    option
                        .setName('number')
                        .setDescription('Position in the queue to remove')
                        .setRequired(true),
                )
                .setDescription('Remove a song from the queue'),
            botAction: removeAction,
        });
    }
    async mapParams(interaction: ChatInputCommandInteraction) {
        const number = interaction.options.getString('number');
        return { ...Command.getBaseParams(interaction), number };
    }

}
export default new RemoveSong();
