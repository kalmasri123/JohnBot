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
    const GAMES_TO_PLAY = [
        'dota 2',
        'age of empires ii: definitive edition',
        'age of empires ii (2013)',
        'age of empires iv',
    ];
    client.on('ready', () => {
        console.log('BOT IS READY');
        let i = 0;
        setInterval(function () {
            client.user.setActivity({ type: 'PLAYING', name: GAMES_TO_PLAY[i] });
            i = (i + 1) % GAMES_TO_PLAY.length;
        }, 2000);
    });
    client.login(env.BOT_TOKEN);
    client.on('messageCreate', Message);
    client.on('presenceUpdate', PresenceUpdate);
} catch (err) {
    console.log(err);
}
