import {
    AudioReceiveStream,
    AudioResource,
    PlayerSubscription,
    VoiceReceiver,
} from '@discordjs/voice';
import { Command } from 'commands/Command';
import {
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    InteractionResponse,
    Message,
} from 'discord.js';
import { Readable, Transform } from 'stream';
import { isFunction } from 'util';
import * as prism from 'prism-media';

//key=guildid.value = VoiceState
export interface SongContent {
    resource: Readable
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
export interface VoiceCommandState {
    members: {
        [key: string]: {
            packets: AudioReceiveStream;
            time: number;
            decoded: prism.opus.Decoder;
            arrBuffer: any[];
        };
    };
    lastTimeSinceCommand: Date
}
export interface VoiceState {
    paused: boolean;
    queue: SongRequest[];
    skippers: number;
    playing: boolean;
    nowPlaying: SongRequest;
    volume: number;
    subscription: PlayerSubscription;
    playStateMessage?: Message;
}
export interface FollowupCommand {
    callback: (message: Message) => any;
    data: any;
    originalMessage?: Message;
    // originalInteraction?:ChatInputCommandInteraction;
    tag?: string;
}
export function createVoiceState(guildId) {
    voiceState[guildId] = {
        queue: [],
        playing: false,
        volume: 1,
    };
}
export function deleteMessageState(guildId, authorId, tag = null) {
    console.log(messageState[guildId][authorId]);

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
export const voiceCommandState: { [key: string]: VoiceCommandState } = {};
