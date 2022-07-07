import 'module-alias/register';

import { env } from '@util/env';
import PresenceUpdate from './controllers/PresenceUpdate';
import MessageEvent from './controllers/Message';

import { Client, Intents, VoiceChannel } from 'discord.js';
import '@util/actions';
import fs from 'fs'
import { GuildScheduledEventEntityTypes, PrivacyLevels } from 'discord.js/typings/enums';
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
    async function createImportantEvent() {
        // const startTime = new Date();
        // startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
        // // const endTime = new Date();
        // // endTime.setHours(startTime.getHours() + 8, 0, 0);
        // let event = await secretChat.scheduledEvents.create({
        //     name: 'Do gus mom',
        //     scheduledStartTime: startTime,
        //     entityType: GuildScheduledEventEntityTypes.VOICE,
        //     privacyLevel: PrivacyLevels.GUILD_ONLY,
        //     channel: (await secretChat.channels.fetch('383034249525067790')) as VoiceChannel,
        // });
        // await event.setStatus('ACTIVE');
        // await delay(8 * 1000 * 60 * 60);
        // if (event.status != 'COMPLETED' && event.status != 'CANCELED') {
        //     await event.setStatus('COMPLETED');
        // }
    }
    client.on('ready', async () => {
        console.log('BOT IS READY');
        await client.user.setActivity(null);
        await client.user.setPresence({ status: 'online' });
        //Create Scheduled events
        const secretChat = await client.guilds.fetch('383034248954773505');
        function editImage() {
            const sharp = require('sharp');
            const referenceDate = new Date('07-05-2022');
            let dayDiff = (Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
            let alpha = 1 - 0.01 * Math.ceil(dayDiff);
            sharp('palpatine.png')
                .removeAlpha()
                .ensureAlpha(alpha)
                .toBuffer()
                .then((buff) => {
                    sharp('john.png')
                        .composite([{ input: buff }])
                        .toBuffer()
                        .then((buff2) => {
                            secretChat.setIcon(buff2)
                        });
                });
        }
        editImage
        setInterval(editImage,60000 * 60);

        setInterval(createImportantEvent, 1000 * 60 * 60 * 16);
    });
    client.login(env.BOT_TOKEN);

    client.on('messageCreate', MessageEvent);
    client.on('presenceUpdate', PresenceUpdate);
} catch (err) {
    console.log(err);
}
