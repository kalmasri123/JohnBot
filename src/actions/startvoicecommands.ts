import { voiceCommandState } from '@util/state';
import { Action, ActionContext, ActionSuccess, BotAction } from './types';
import * as wavConverter from 'wav-converter';
import * as speech from '@google-cloud/speech';
import * as fs from 'fs';
import * as prism from 'prism-media';
import { EndBehaviorType, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import { CreateVoiceCommandStateIfNotExists, CreateVoiceStateIfNotExists } from '@util/decorators';
import { actionList, actions } from '@util/actions';
import { TextChannel, VoiceChannel } from 'discord.js';
import { callValidVoiceAction, VoiceCommandContext } from '@util/argMapping';
import stringSimilarity from 'string-similarity-js';
import GuildConfig from 'models/GuildConfig';
import { buildInteractionResponseBody } from '@util/helpers';
export interface StartVoiceCommandsActionContext extends ActionContext {
    voiceChannel: VoiceChannel;
}
const client = new speech.SpeechClient();

const startVoiceCommandsAction: BotAction = async function ({
    guild,
    voiceChannel,
}: StartVoiceCommandsActionContext) {
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    const memberVoiceChannel = voiceChannel;
    if (!memberVoiceChannel) return ActionSuccess('Please enter a voice channel!');
    if (!memberVoiceChannel.joinable)
        return ActionSuccess('I do not have sufficient permissions to join this voice channel!');
    let voiceConnection = getVoiceConnection(guild.id);
    if (!voiceConnection) {
        voiceConnection = await joinVoiceChannel({
            channelId: memberVoiceChannel.id,
            guildId: guild.id,
            adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator as any,
            selfDeaf: false,
        });
    }
    let closed = false;
    voiceConnection.receiver.speaking.on('start', (id) => {
        if (closed) return;

        if (!voiceCommandState[guild.id].members[id]) {
            console.log('subscribing', id);
            const subscription = voiceConnection.receiver.subscribe(id, {
                end: { behavior: EndBehaviorType.Manual },
            });
            const decoder = new prism.opus.Decoder({
                channels: 2,
                rate: 48000,
                frameSize: 960,
            });
            voiceCommandState[guild.id].members[id] = {
                packets: subscription,
                time: Date.now(),
                decoded: decoder,
                arrBuffer: [],
            };

            subscription.pipe(decoder as any);
            decoder.on('data', (data) => {
                voiceCommandState[guild.id].members[id].arrBuffer.push(data);
            });
            decoder.on('end', async () => {
                let pcmData = Buffer.concat(voiceCommandState[guild.id].members[id].arrBuffer);
                voiceCommandState[guild.id].members[id].arrBuffer.length = 0;
                delete voiceCommandState[guild.id].members[id];

                let wavData = wavConverter.encodeWav(pcmData, {
                    numChannels: 2,
                    sampleRate: 48000,
                    byteRate: 16,
                });
                const config = {
                    encoding: 1,
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                    audioChannelCount: 2,
                };

                const audio = {
                    content: wavData.toString('base64'),
                };

                const request = {
                    config: config,
                    audio: audio,
                };

                const [response] = await client.recognize(request);
                if (response['results'].length > 0) {
                    //There is a valid thing to parse
                    //Find valid command name within action list
                    let messageContent = response['results'][0]['alternatives'][0]['transcript'];
                    let args = messageContent.split(' ');
                    console.log(args);

                    let prefixIndex = args.findIndex((el) => el.toLowerCase() == 'john');
                    if (prefixIndex == -1) {
                        if (
                            new Date().getTime() -
                                voiceCommandState[guild.id].lastTimeSinceCommand.getTime() >=
                            300000
                        ) {
                            //Close the subscriber
                            closed = true;
                        }
                        return;
                    }
                    const sliced = args.slice(prefixIndex);
                    let actionIndex = -1;
                    let actionName = null;
                    outer: for (let i in actionList) {
                        const action = actionList[i];
                        for (let j in sliced) {
                            const arg = sliced[j];
                            if (stringSimilarity(arg, action) >= 0.7) {
                                actionIndex = parseInt(j);
                                actionName = action;
                                break outer;
                            }
                        }
                    }

                    console.log('ACTIONS', actions);
                    if (actionIndex == -1) {
                        console.log('Action not found');
                        if (
                            new Date().getTime() -
                                voiceCommandState[guild.id].lastTimeSinceCommand.getTime() >=
                            300000
                        ) {
                            //Close the subscriber
                            closed = true;
                        }
                        return;
                    }
                    console.log('Action found', args.slice(actionIndex));
                    voiceCommandState[guild.id].lastTimeSinceCommand = new Date();
                    const context: VoiceCommandContext = {
                        member: guild.members.resolve(id),
                        voiceChannel: voiceChannel,
                        guild,
                    };
                    const actionResponse = await callValidVoiceAction(actionName, args.slice(actionIndex), context);
                    (guild.channels.resolve(guildConfig.preferredTextChannel) as TextChannel)?.send(buildInteractionResponseBody(actionResponse));
                }
                console.log(response['results'][0]);
                console.log('done');
            });
        }
        voiceCommandState[guild.id].members[id].time = Date.now();

        console.log(`${id} Started speaking`);
    });
    voiceConnection.receiver.speaking.on('end', (id) => {
        // voiceConnection.receiver.subscribe(id, { mode: 'pcm' });
        console.log(`${id} Stopped speaking`);
        //Wait 2 seconds. If time is greater than 2 seconds, destroy and delete state.
        setTimeout(async function () {
            let state = voiceCommandState[guild.id].members[id];
            if (state && Date.now() - state.time >= 2000) {
                //End capture
                state.packets.destroy();
                state.decoded.end();
            }
        }, 2000);
    });
    return ActionSuccess('Connected');
};
export const actionName = 'startvoicecommands';
export const type = 'action';
let decorated = startVoiceCommandsAction;
decorated = CreateVoiceCommandStateIfNotExists()(startVoiceCommandsAction);
decorated = CreateVoiceStateIfNotExists()(decorated);
export default decorated;
