import { getVoiceConnection } from '@discordjs/voice';
import { Command } from 'commands/Command';
import { Guild, GuildMember, Message } from 'discord.js';
import { messageState, voiceCommandState, voiceState } from './state';
import { SlashAction, SlashActionContext } from 'actions/types';

export function RequiresSameVoiceChannel() {
    return function (descriptor:SlashAction) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
            const { interaction } = args[0];
            console.log(interaction);
            const voiceConnection = getVoiceConnection(interaction.guild.id);
            const requesterVoiceChannel = (interaction.member as GuildMember).voice.channelId;
            console.log(interaction.guild);
            const botVoiceChannel = interaction.guild.members.me.voice?.channelId;
            if (botVoiceChannel && botVoiceChannel != requesterVoiceChannel) {
                interaction.editReply('Please join my voice channel');
                return null;
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}
export function ClearIfNoVoiceConnection() {
    return function (descriptor:SlashAction) {
        const oldMethod = descriptor;

        descriptor = function (...args) {
            const { interaction } = args[0];
            console.log(interaction);
            const voiceConnection = getVoiceConnection(interaction.guild.id);
            if (!voiceConnection && voiceState[interaction.guild.id]) {
                voiceState[interaction.guild.id].nowPlaying = null;
                voiceState[interaction.guild.id].playing = null;
                voiceState[interaction.guild.id].queue = [];
            }
            return oldMethod.apply(this, args);
        };
        return descriptor;
        // Do something
    };
}

export function CreateVoiceStateIfNotExists() {
    return function (descriptor:SlashAction) {
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
