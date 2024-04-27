import { Command, Repliable } from './Command';
import {
    ChatInputCommandInteraction,
    GuildMember,

    Message,

    SlashCommandBuilder,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import setPreferredChannelAction, { SetPreferredChannelContext } from 'actions/setpreferredchannel';
class SetPreferredChannelCommand extends Command<SetPreferredChannelContext> {
    constructor() {
        super({
            minArgs: 2,
            commandName: 'setpreferredchannel',
            slashCommand: new SlashCommandBuilder()
                .setName('setpreferredchannel')
                .addStringOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Text Channel to set default messages to')
                        
                )
                .setDescription('Sends message to this channel when a channel isn\'t provided'),
            botAction: setPreferredChannelAction,
        });
    }
    getTextChannelId(mention:string){
        const textChannelRegex = /<#([0-9]{15,25})>/
        return mention.match(textChannelRegex)?.[1]
    }
    override async mapParams(interaction: ChatInputCommandInteraction): Promise<SetPreferredChannelContext> {
        const textChannel = interaction.guild.channels.cache.get(this.getTextChannelId(interaction.options.get("channel").value as string))
        if(!textChannel || !textChannel.isTextBased){
            interaction.editReply("Invalid Text Channel")
            throw new Error("Invalid Text Channel")
        }
        return {
            guild: interaction.guild,
            textChannel: textChannel as TextChannel,
        };
    }
    
}
export default new SetPreferredChannelCommand();
