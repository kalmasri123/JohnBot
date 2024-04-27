import { ClearIfNoVoiceConnection, CreateVoiceStateIfNotExists } from '@util/decorators';
import { BotAction, ActionContext, ActionFailure } from './types';
import { TextChannel } from 'discord.js';
import GuildConfig from 'models/GuildConfig';
export interface SetPreferredChannelContext extends ActionContext {
    textChannel: TextChannel;
}

const setPreferredChannelAction: BotAction = async function ({
    guild,
    textChannel,
}: SetPreferredChannelContext) {
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    guildConfig.preferredTextChannel = textChannel.id
    await guildConfig.save()
    return ActionFailure('✅ Updated Default Channel');
};

export const actionName = 'setpreferredchannel';
export const type = 'action';
let decorated = CreateVoiceStateIfNotExists()(setPreferredChannelAction);
decorated = ClearIfNoVoiceConnection()(decorated);

export default decorated;
