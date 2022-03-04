import { AudioResource, PlayerSubscription } from '@discordjs/voice';
import { Command } from 'commands/Command';
import { Guild, GuildMember, Message } from 'discord.js';
import { Readable, Transform } from 'stream';

//key=guildid.value = VoiceState
export interface SongContent {
    resource: Readable | (() => Readable);
    audioResource?: AudioResource;
    title: string;
    thumbnail?: string;
    duration?: number;
    lazy: boolean;
}
export interface SongRequest {
    content: SongContent | Promise<SongContent>;

    requester?: GuildMember;
    link?: string;
}
export interface VoiceState {
    paused: boolean;
    queue: SongRequest[];
    skippers: number;
    playing: boolean;
    nowPlaying: SongRequest;
    volume: number;
    subscription: PlayerSubscription;
}
export interface FollowupCommand {
    callback: (message: Message) => any;
    data: any;
    originalMessage: Message;
}
export function createVoiceState(guildId) {
    voiceState[guildId] = {
        queue: [],
        playing: false,
        volume: 1,
    };
}
export const messageState: { [key: string]: { [key: string]: FollowupCommand } } = {};
export const voiceState = {};
