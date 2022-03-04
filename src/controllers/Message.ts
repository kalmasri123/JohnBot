import { Command } from 'commands/Command';
import Discord, { Guild } from 'discord.js';
import { cp, readdirSync } from 'fs';
import { join } from 'path';
import { env } from '@util/env';
import { nextTick } from 'process';
import { messageState } from '@util/state';

const commandNames = readdirSync(join(__dirname, '../commands/')).filter((el) => {
    console.log(el);
    const extension = process.env.ENV == 'DEBUG' ? '.ts' : '.js';
    return el != `Command${extension}` && el.endsWith(extension);
});
const commands = {};
const messageQueue = {};
commandNames.map(async (commandName) => {
    const command: Command = (await import(`../commands/${commandName}`)).default;
    commands[command.commandName] = command;
});

async function handleMessage(guild: Guild) {
    if (messageQueue[guild.id].queue.length == 0) {
        messageQueue[guild.id].handlingMessage = false;
        return;
    }
    let resolved = false;
    const next = (): void => {
        if (!resolved) {
            resolved = true;
            handleMessage(guild);
        }
    };
    const message: Discord.Message = messageQueue[guild.id].queue.shift();
    messageQueue[guild.id].handlingMessage = true;
    const prefix = message.content.charAt(0);
    if (message.author.bot) return next();
    // if (prefix != env.PREFIX) return next();
    //Identify if command
    const args = message.content.split(' ');
    const commandName = args[0].slice(1);
    const command: Command = commands[commandName] ? commands[commandName] : null;
    if (!command) {
        try {
            let followUpMessage = messageState[guild.id][message.member.id];
            console.log(messageState);
            if (followUpMessage) {
                let res = await followUpMessage.callback(message);
                if (res) {
                    delete messageState[guild.id][message.member.id];
                }
                if (!resolved) {
                    return next();
                }
            } else {
                return next();
            }
        } catch (err) {
            if (!resolved) {
                console.log(err);
                message.reply('An Unexpected error has occurred');
                next();
            }
        }
        return next();
    }
    try {
        await command.executeFunction(message, next);
        if (!resolved) {
            next();
        }
        return;
    } catch (err) {
        if (!resolved) {
            console.log(err);
            message.reply('An Unexpected error has occurred');
            next();
        }
    }
    return null;
}

export default async function Message(message: Discord.Message) {
    console.log(message.content);
    if (!messageQueue[message.guild.id])
        messageQueue[message.guild.id] = { queue: [], handlingMessage: false };

    messageQueue[message.guild.id].queue.push(message);
    if (!messageQueue[message.guild.id].handlingMessage) {
        handleMessage(message.guild);
    }
}
