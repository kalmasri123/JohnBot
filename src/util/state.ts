import { AudioResource, PlayerSubscription } from '@discordjs/voice';
import { Command } from 'commands/Command';
import { Guild, GuildMember, Message } from 'discord.js';
import { Readable, Transform } from 'stream';
import { isFunction } from 'util';

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
    tag?:string;
}
export function createVoiceState(guildId) {
    voiceState[guildId] = {
        queue: [],
        playing: false,
        volume: 1,
    };
}
export function deleteMessageState(guildId, authorId, tag = null) {
    console.log(messageState[guildId][authorId])
    
    if (
        messageState[guildId] &&
        messageState[guildId][authorId] &&
        (!tag || (tag && messageState[guildId][authorId].tag == tag))
    ) {
        messageState[guildId][authorId] = null;
        return true;
    }
    return false;
} //Guild - Author - Tag
export const messageState: { [key: string]: { [key: string]: FollowupCommand } } = {};
export const voiceState = {};
