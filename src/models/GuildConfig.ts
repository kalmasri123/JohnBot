import { Client, DiscordAPIError, Guild } from 'discord.js';
import mongoose, { Schema } from 'mongoose';
interface GuildConfig {
    guildId: string;
    preferredTextChannel: string;
}
const GuildConfigSchema = new Schema<GuildConfig>({
    guildId: { required: true, type: String },
    preferredTextChannel: { required: false, type: String },
});

const model = mongoose.model('guildconfig', GuildConfigSchema);

export const loadGuildConfigs = async (client: Client) => {
    client.guilds.cache.forEach(async (g) => {
        const config = await model.findOneAndUpdate({ guildId: g.id }, {}, { upsert: true });
    });
};
export const addGuildConfig = async (client: Client, guild: Guild) => {
    const config = await model.findOneAndUpdate({ guildId: guild.id }, {}, { upsert: true });
};
export default model;
