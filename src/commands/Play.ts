import { Command, Repliable } from './Command';
import {
    ChatInputCommandInteraction,
    GuildMember,

    Message,

    SlashCommandBuilder,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import { CreateVoiceStateIfNotExists, RequiresSameVoiceChannel } from '@util/decorators';
import playAction, { PlayActionContext } from 'actions/play';
import { voiceState, VoiceState } from '@util/state';

class PlayCommand extends Command<PlayActionContext> {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'play',
            slashCommand: new SlashCommandBuilder()
                .setName('play')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('Video name to search for')
                        .setRequired(false),
                )
                // .addAttachmentOption((option) =>
                //     option.setName('file').setDescription('Mp3 file').setRequired(false),
                // )
                .setDescription('Play a song'),
            botAction: playAction,
        });
    }
    override async mapParams(interaction: ChatInputCommandInteraction): Promise<PlayActionContext> {
        const member = interaction.member as GuildMember;
        const voiceChannel = member.voice.channel as VoiceChannel;
        return {
            guild: interaction.guild,
            link: interaction.options.getString('name'),
            member,
            attachment: interaction.options.getAttachment('file'),
            voiceChannel,
            textChannel: interaction.channel as TextChannel,
        };
    }
    
}
export default new PlayCommand();
