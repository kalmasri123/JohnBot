import { Command, Repliable } from './Command';
import { Message, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import pauseAction from 'actions/pause';
import { VoiceState, voiceState } from '@util/state';
class PauseCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'pause',
            slashCommand: new SlashCommandBuilder()
                .setName('pause')
                .setDescription('Pause the current audio'),
            botAction: pauseAction,
        });
    }
    override async executeCommand(interaction: Repliable): Promise<Message<boolean>> {
        const output = await super.executeCommand(interaction)
        const guildVoiceState: VoiceState = voiceState[interaction.guild.id];
        await guildVoiceState.playStateMessage?.delete()
        guildVoiceState.playStateMessage = output;
        return output;
    }
}
export default new PauseCommand();
