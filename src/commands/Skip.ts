import { Command, ExecuteFunction } from './Command';
import {
    ChatInputCommandInteraction,
    GuildMember,
    Message,
    SlashCommandBuilder,
    VoiceChannel,
} from 'discord.js';
import { VoiceState, voiceState } from '@util/state';
import { CreateVoiceStateIfNotExists } from '@util/decorators';
import skipAction, { SkipActionContext } from 'actions/skip';
class SkipCommand extends Command<SkipActionContext> {
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
    override async mapParams(interaction: ChatInputCommandInteraction) {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;
        return {
            ...Command.getBaseParams(interaction),
            member: interaction.member as GuildMember,
            voiceChannel
        };
    }
}
export default new SkipCommand();
