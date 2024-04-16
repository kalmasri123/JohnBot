import { Command } from 'commands/Command';
import Discord, { ApplicationCommandPermissionType, Client, Guild, GuildStickerManager } from 'discord.js';
import { cp, readdirSync } from 'fs';
import { join } from 'path';
import { env } from '@util/env';
import { nextTick } from 'process';
import { messageState } from '@util/state';
import { commandNames, commands } from '@util/commandManager';
const { REST, Routes } = require('discord.js');

const messageQueue = {};



async function handleMessage(guild: Guild) {
    if (!messageState[guild.id]) {
        messageState[guild.id] = {};
    }
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
            let followUpMessage = messageState[guild.id][message.member.id] || messageState[guild.id][message.channelId];
            if (followUpMessage) {
                let res = await followUpMessage.callback(message);
                if (res) {
                    if(messageState[guild.id][message.member.id]) delete messageState[guild.id][message.member.id];
                    if(messageState[guild.id][message.channelId]) delete messageState[guild.id][message.channelId];
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
