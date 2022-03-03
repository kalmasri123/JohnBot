import 'module-alias/register';

import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import { Client, Intents } from 'discord.js';
import Message from './controllers/Message';
try {
    const client: Client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,

            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_VOICE_STATES,
        ],
        retryLimit: Infinity,
        presence: {
            status: 'idle',
        },
    });
    client.on('ready', () => {
        console.log('BOT IS READY');
    });
    client.login(env.BOT_TOKEN);
    client.on('messageCreate', Message);
    client.on('presenceUpdate', PresenceUpdate);
} catch (err) {
    console.log(err);
}
