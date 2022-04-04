// import 'module-alias/register';

import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import { Client, Intents } from 'discord.js';
import Message from './controllers/Message';
import { GuildScheduledEventPrivacyLevels } from 'discord.js/typings/enums';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
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
    async function playAllGames(){
        for(let i = 0; i < GAMES_TO_PLAY.length; i++){
            await delay(2000)
            await client.user.setActivity({ type: 'PLAYING', name: GAMES_TO_PLAY[i] });
        }
    }
    client.on('ready', async () => {
        console.log('BOT IS READY');
        await client.user.setActivity(null)
        playAllGames()

        setInterval(function () {
            playAllGames()
        }, 1000 * 60 * 60 * 24);
    });
    client.login(env.BOT_TOKEN);
    client.on('messageCreate', Message);
    client.on('presenceUpdate', PresenceUpdate);
} catch (err) {
    console.log(err);
}
