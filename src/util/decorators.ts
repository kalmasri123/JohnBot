import { getVoiceConnection } from '@discordjs/voice';
import { Command } from 'commands/Command';
import { Guild, GuildMember, Message, VoiceChannel } from 'discord.js';
import { messageState, voiceCommandState, voiceState } from './state';
import { BotAction, ActionContext, ActionFailure } from 'actions/types';
import { PlayActionContext } from 'actions/play';

export function RequiresSameVoiceChannel() {
    return function (descriptor:BotAction) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
            const actionContext = args[0] as (PlayActionContext)
            console.log(Object.keys(actionContext))
            const { guild,voiceChannel } = actionContext;
            const voiceConnection = getVoiceConnection(guild.id);
            // const requesterVoiceChannel = voiceChannel.channelId;
            const botVoiceChannel = guild.members.me.voice?.channelId;
            if (botVoiceChannel && botVoiceChannel != voiceChannel.id) {
                return ActionFailure('Please join my voice channel');
                
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}
export function ClearIfNoVoiceConnection() {
    return function (descriptor:BotAction) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
            const { guild } = args[0];
            const voiceConnection = getVoiceConnection(guild.id);
            if (!voiceConnection && voiceState[guild.id]) {
                voiceState[guild.id].nowPlaying = null;
                voiceState[guild.id].playing = null;
                voiceState[guild.id].queue = [];
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}

export function CreateVoiceStateIfNotExists() {
    return function (descriptor:BotAction) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
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
    return function (descriptor) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
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
    return function (descriptor) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
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
