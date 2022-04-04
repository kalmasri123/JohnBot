import { getVoiceConnection } from '@discordjs/voice';
import { Command } from 'commands/Command';
import { Message } from 'discord.js';
import { messageState, voiceCommandState, voiceState } from './state';

export function RequiresSameVoiceChannel() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldMethod = descriptor.value;

        descriptor.value = function (...args) {
            const message = args[0];
            const voiceConnection = getVoiceConnection(message.guild.id);
            const requesterVoiceChannel = message.member.voice.channelId;
            const botVoiceChannel = message.guild.me.voice.channelId;
            if (botVoiceChannel && botVoiceChannel != requesterVoiceChannel) {
                message.reply('Please join my voice channel');
                return null;
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}

export function CreateVoiceStateIfNotExists() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldMethod = descriptor.value;

        descriptor.value = function (...args) {
            const guildId = args[0].guild.id;
            if (!voiceState[guildId]) {
                voiceState[guildId] = {
                    queue: [],
                    playing: false,
                    volume: 1,
                };
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}

export function CreateVoiceCommandStateIfNotExists() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldMethod = descriptor.value;

        descriptor.value = function (...args) {
            const guildId = args[0].guild.id;
            if (!voiceCommandState[guildId]) {
                voiceCommandState[guildId] = { members: {} };
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}

export function CreateMessageStateIfNotExists() {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        const oldMethod = descriptor.value;

        descriptor.value = function (...args) {
            const guildId = args[0].guild.id;
            if (!messageState[guildId]) {
                messageState[guildId] = {};
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}
