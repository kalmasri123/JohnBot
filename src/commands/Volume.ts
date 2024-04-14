import { Command, ExecuteFunction } from './Command';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import volumeAction, { VolumeActionContext } from 'actions/volume';
class Volume extends Command<VolumeActionContext> {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'volume',
            slashCommand: new SlashCommandBuilder()
                .setName('volume')
                .addStringOption((option) =>
                    option
                        .setName('volume')
                        .setDescription('Volume to adjust to')
                        .setRequired(true),
                )
                .setDescription('Adjust the volume'),
            botAction: volumeAction,
        });
    }
    async mapParams(interaction: ChatInputCommandInteraction) {
        return {
            ...Command.getBaseParams(interaction),
            volume: interaction.options.getNumber('volume'),
        };
    }

}
export default new Volume();
