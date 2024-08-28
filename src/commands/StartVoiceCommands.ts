import { Command, ExecuteFunction } from './Command';
import {
    ChatInputCommandInteraction,
    GuildMember,
    Message,
    SlashCommandBuilder,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import startVoiceCommandsAction, {
    StartVoiceCommandsActionContext,
} from 'actions/startvoicecommands';
class StartVoiceCommands extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'startvoicecommands',
            botAction: startVoiceCommandsAction,
            slashCommand: new SlashCommandBuilder()
                .setName('startvoicecommands')

                .setDescription('Start listening for voice commands'),
        });
    }
    override async mapParams(
        interaction: ChatInputCommandInteraction,
    ): Promise<StartVoiceCommandsActionContext> {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;
        return {
            guild: interaction.guild,
            voiceChannel,
        };
    }
}
//     async executeFunction(message: Message, fn: () => void = null) {
//         super.executeFunction(message, fn);
//         // startVoiceCommandsAction(this, fn);
//         return;
//     }
// }
export default new StartVoiceCommands();
