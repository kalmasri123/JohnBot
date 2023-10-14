import 'module-alias/register';

import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import MessageEvent from './controllers/Message';
import { commands, registerCommands } from '@util/commandManager';
import { Client, VoiceChannel,GatewayIntentBits, Events } from 'discord.js';
import '@util/actions';
import { Command } from 'commands/Command';
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
        await registerCommands(client);

        //Create Scheduled events
    });
    client.login(env.BOT_TOKEN);

    client.on('messageCreate', MessageEvent);
    client.on('presenceUpdate', PresenceUpdate);
    client.on(Events.InteractionCreate,async interaction=>{
        if (!interaction.isChatInputCommand()) return;
        const commandName = interaction.commandName;
        console.log(commandName) 
        try {
            const command:Command = commands[commandName];
            command.executeCommand(interaction,()=>{})
        }
        catch(error){
            console.error(error)
            console.error(`Error executing ${interaction.commandName}`)
        }
    })
} catch (err) {
    console.log(err);
}
