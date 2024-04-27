import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import MessageEvent from './controllers/Message';
import { commands, registerCommands } from '@util/commandManager';
import {
    Client,
    VoiceChannel,
    GatewayIntentBits,
    Events,
    SlashCommandIntegerOption,
    GuildMember,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Guild,
    TextChannel,
} from 'discord.js';
import '@util/actions';
import { Command } from 'commands/Command';
import mongoose from 'mongoose';
import Macro from 'models/Macro';
import { ValidMacros } from '@util/macros';
import { ActionContext } from 'actions/types';
import { buildInteractionResponseBody } from '@util/helpers';
import * as express from 'express';
import playAction from 'actions/play';
import {
    discordGuard,
    DiscordUser,
    getGuildsOfUser,
    getTokenPairFromCode,
    refreshAccessToken,
    setCookies,
    TokenSet,
} from '@util/discordApi';
import GuildConfig, { addGuildConfig } from 'models/GuildConfig';

const app = express();
import * as cookieParser from 'cookie-parser';
import { loadGuildConfigs } from 'models/GuildConfig';
const PORT = process.env.port || 3000;
mongoose.connect(env.MONGOURI);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
    const client: Client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
        ],
        // retryLimit: Infinity,
        presence: {
            status: 'idle',
        },
    });

    client.on('ready', async () => {
        console.log('BOT IS READY');
        await client.user.setActivity(null);
        await client.user.setPresence({ status: 'online' });
        await loadGuildConfigs(client);
        await registerCommands();

        //Create Scheduled events
    });
    client.on('guildCreate', (guild) => {
        addGuildConfig(client, guild);
    });
    client.on('messageCreate', MessageEvent);
    client.on('presenceUpdate', PresenceUpdate);
    client.on(
        Events.InteractionCreate,
        async (interaction: ButtonInteraction | ChatInputCommandInteraction) => {
            // if (!interaction.isChatInputCommand() || !interaction.isButton()) return;

            let commandName = null;
            commandName = interaction.isChatInputCommand()
                ? interaction.commandName
                : interaction.customId;
            try {
                const command: Command = commands[commandName];
                if (!command) {
                    const macro = await Macro.findOne({ name: commandName });
                    if (!macro) throw 'Not found';
                    const macroSpec = ValidMacros.find((m) => m.actionName == macro.action);
                    let args = {};
                    for (let k of Object.keys(macroSpec.argMap)) {
                        args[macroSpec.argMap[k]] = macro.args[k];
                    }
                    args = {
                        ...args,
                        ...Command.getBaseParams(interaction),
                        member: interaction.member as GuildMember,
                    };
                    await interaction.deferReply();
                    const res = await macroSpec.botAction(args as ActionContext);
                    await interaction.editReply(buildInteractionResponseBody(res));
                    return;
                }
                await command.executeCommand(interaction);
            } catch (error) {
                console.error(error);
                console.error(`Error executing ${commandName}`);
            }
        },
    );
    app.listen(PORT);
    app.use(cookieParser());
    app.get('/refresh', async (req, res, next) => {
        try {
            let refreshToken = req.cookies['refreshToken'];
            if (!refreshToken)
                return res.status(401).json({ success: false, reason: 'No refresh token' });

            const tokens: TokenSet = await refreshAccessToken(refreshToken);
            setCookies(tokens, res);
            res.json({ success: true });
        } catch (err) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            res.clearCookie('authMethod');
            next(err);
        }
    });
    app.get('/authorize', async (req, res) => {
        console.log(req.query);
        try {
            const tokens = await getTokenPairFromCode(req.query.code?.toString());
            setCookies(tokens, res);
            return res.status(200).json('You may now close this tab');
        } catch (error) {
            return res.status(400).json({ success: false });
        }
    });
    app.get('/play', discordGuard, async (req, res) => {
        console.log(req.query);
        const link = req.query.link as string;
        const user: DiscordUser = (req as any).user;
        if (!link) return res.status(400).json({ success: false, reason: 'No link provided' });
        try {
            const userGuilds = await getGuildsOfUser(req.cookies.accessToken);
            const mutualGuilds: Guild[] = await Promise.all(
                userGuilds
                    .filter((g) => client.guilds.cache.get(g.id))
                    .map(async (g) => await client.guilds.fetch(g.id)),
            );
            const voiceChannel: VoiceChannel = mutualGuilds
                .find((g) => {
                    return g.members.cache.get(user.id).voice.channel;
                })
                ?.members?.cache?.get(user.id).voice.channel as VoiceChannel;
            if (!voiceChannel)
                return res.status(400).json({ success: false, reason: 'No Voice Channel' });
            const guild = voiceChannel.guild;
            const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
            const guildMember = guild.members.cache.get(user.id);
            playAction({
                guild: guild,
                attachment: null,
                link,
                voiceChannel,
                member: guildMember,
                textChannel: guild.channels.cache.get(
                    guildConfig?.preferredTextChannel,
                ) as TextChannel,
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.log(error);
            return res.status(401).json({ success: false });
        }
    });
    client.login(env.BOT_TOKEN);
} catch (err) {
    console.log(err);
}
