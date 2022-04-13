import 'module-alias/register';

import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import MessageEvent from './controllers/Message';

import { Client, Intents, Message, MessageSelectMenu } from 'discord.js';
import '@util/actions';
import { get, set } from '@util/redis';
import { GuildScheduledEventPrivacyLevels } from 'discord.js/typings/enums';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
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
        { game: 'Dota 2', points: 200, minPlayTime: 25 * 60 * 1000 },
        { game: 'Age of Empires II: Definitive Edition', points: 100, minPlayTime: 15 * 60 * 1000 },
        { game: 'Age of Empires II (2013)', points: 100, minPlayTime: 15 * 60 * 1000 },
        { game: 'Age of Empires IV', points: 100, minPlayTime: 15 * 60 * 1000 },
        { game: 'Hell Let Loose', points: 100, minPlayTime: 15 * 60 * 1000 },
        { game: 'Risk Of Rain 2', points: 100, minPlayTime: 15 * 60 * 1000 },
        { game: 'Counter-Strike: Global Offensive', points: 10, minPlayTime: 30 * 60 * 1000 },
    ];
    async function playAllGames() {
        for (let i = 0; i < GAMES_TO_PLAY.length; i++) {
            await client.user.setActivity({ type: 'PLAYING', name: GAMES_TO_PLAY[i].game });
            console.log(
                'current delay time',
                10 * 1000 * 60 + parseInt((await get('presenceChangeLimit')) || 0),
            );
            await delay(GAMES_TO_PLAY[i].minPlayTime + 25000);
            await delay(2000);

            await client.user.setActivity(null);
            await delay(10 * 1000 * 60 + parseInt(await get('presenceChangeLimit')));
        }
    }
    client.on('ready', async () => {
        console.log('BOT IS READY');
        await client.user.setActivity(null);
        await client.user.setPresence({ status: 'online' });
        playAllGames();

        setInterval(function () {
            playAllGames();
        }, 1000 * 60 * 60 * 3.1);
    });
    client.login(env.BOT_TOKEN);
    client.on('messageCreate', async (message: Message) => {
        //Will handle dealing with rate limit
        if (
            message.author.id == '855651612197257237' &&
            message.mentions.members.has(client.user.id) &&
            message.content.includes('SUSPICIOUS')
        ) {
            console.log('MENTIONS ME');
            //increase cooldown by a minute
            await set('presenceChangeLimit', ((await get('presenceChangeLimit')) || 0) + 60000);
        }
    });
    client.on('messageCreate', MessageEvent);
    client.on('presenceUpdate', PresenceUpdate);
} catch (err) {
    console.log(err);
}
