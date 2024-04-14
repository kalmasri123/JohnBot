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
} from 'discord.js';
import '@util/actions';
import { Command } from 'commands/Command';
import mongoose from 'mongoose';
import Macro from 'models/Macro';
import { ValidMacros } from '@util/macros';
import { ActionContext } from 'actions/types';
import { buildInteractionResponseBody } from '@util/helpers';
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
        await registerCommands();

        //Create Scheduled events
    });
    client.login(env.BOT_TOKEN);

    client.on('messageCreate', MessageEvent);
    client.on('presenceUpdate', PresenceUpdate);
    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;
        console.log(commandName);
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
                console.log(args);
                await interaction.deferReply();
                const res = await macroSpec.botAction(args as ActionContext);
                await interaction.editReply(buildInteractionResponseBody(res));
                return;
            }
            command.executeCommand(interaction);
        } catch (error) {
            console.error(error);
            console.error(`Error executing ${interaction.commandName}`);
        }
    });
} catch (err) {
    console.log(err);
}
