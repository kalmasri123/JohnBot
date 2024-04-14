// import { voiceCommandState } from '@util/state';
// import { Action, ActionContext } from './types';
// import * as wavConverter from 'wav-converter';
// import * as speech from '@google-cloud/speech';
// import * as fs from 'fs';
// import * as prism from 'prism-media';
// import { EndBehaviorType, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
// import { CreateVoiceCommandStateIfNotExists, CreateVoiceStateIfNotExists } from '@util/decorators';
// import { actions } from '@util/actions';
// const client = new speech.SpeechClient();

// const startVoiceCommandsAction: Action = async function ({ message, guild }: ActionContext, fn) {
//     const memberVoiceChannel = message.member.voice.channel;
//     if (!memberVoiceChannel) return message.reply('Please enter a voice channel!');
//     if (!memberVoiceChannel.joinable)
//         return message.reply('I do not have sufficient permissions to join this voice channel!');
//     let voiceConnection = getVoiceConnection(guild.id);
//     if (!voiceConnection) {
//         voiceConnection = await joinVoiceChannel({
//             channelId: memberVoiceChannel.id,
//             guildId: guild.id,
//             adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator as any,
//             selfDeaf: false,
//         });
//     }
//     let decoder = new prism.opus.Decoder({ channels: 2, rate: 48000, frameSize: 960 });
//     voiceConnection.receiver.speaking.on('start', (id) => {
        
//         if (!voiceCommandState[guild.id].members[id]) {
//             console.log('subscribing', id);
//             const subscription = voiceConnection.receiver.subscribe(id, {
//                 end: { behavior: EndBehaviorType.Manual },
//             });
//             const decoder = new prism.opus.Decoder({
//                 channels: 2,
//                 rate: 48000,
//                 frameSize: 960,
//             });
//             voiceCommandState[guild.id].members[id] = {
//                 packets: subscription,
//                 time: Date.now(),
//                 decoded: decoder,
//                 arrBuffer:[]
//             };

//             subscription.pipe(decoder);
//             decoder.on('data', (data) => {
//                 voiceCommandState[guild.id].members[id].arrBuffer.push(data);
//             });
//             decoder.on('end', async () => {
//                 let pcmData = Buffer.concat(voiceCommandState[guild.id].members[id].arrBuffer);
//                 voiceCommandState[guild.id].members[id].arrBuffer.length = 0;
//                 delete voiceCommandState[guild.id].members[id];

//                 let wavData = wavConverter.encodeWav(pcmData, {
//                     numChannels: 2,
//                     sampleRate: 48000,
//                     byteRate: 16,
//                 });
//                 const config = {
//                     encoding: 1,
//                     sampleRateHertz: 48000,
//                     languageCode: 'en-US',
//                     audioChannelCount: 2,
//                 };

//                 const audio = {
//                     content: wavData.toString('base64'),
//                 };

//                 const request = {
//                     config: config,
//                     audio: audio,
//                 };

//                 const [response] = await client.recognize(request);
//                 if (response['results'].length > 0) {
//                     //There is a valid thing to parse
//                     //Find valid command name within action list
//                     let messageContent = response['results'][0]['alternatives'][0]['transcript'];
//                     let args = messageContent.split(' ');
//                     console.log(args);

//                     let prefixIndex = args.findIndex(el=>el.toLowerCase()=='john')
//                     if(prefixIndex == -1) return;
//                     let actionIndex = args.slice(prefixIndex).findIndex((el) => actions[el.toLowerCase()]);

//                     if (actionIndex == -1) {
//                         console.log('Action not found');

//                         return;
//                     }
//                     console.log('Action found', args.slice(actionIndex));
//                     let actionFunction = actions[args[actionIndex]];
//                     await actionFunction({message,guild,args:args.slice(actionIndex)},fn)
//                 }
//                 console.log(response['results'][0]);
//                 console.log('done');

//             });
//         }
//         voiceCommandState[guild.id].members[id].time = Date.now();

//         console.log(`${id} Started speaking`);
//     });
//     voiceConnection.receiver.speaking.on('end', (id) => {
//         // voiceConnection.receiver.subscribe(id, { mode: 'pcm' });
//         console.log(`${id} Stopped speaking`);
//         //Wait 2 seconds. If time is greater than 2 seconds, destroy and delete state.
//         setTimeout(async function () {
//             let state = voiceCommandState[guild.id].members[id];
//             if (state && Date.now() - state.time >= 2000) {
//                 //End capture
//                 state.packets.destroy();
//                 state.decoded.end();
//             }
//         }, 2000);
//     });
//     return;
// };
// export const actionName = 'startvoicecommands';
// export const type = 'action';
// let decorated = startVoiceCommandsAction
// // let decorated: Action = CreateVoiceCommandStateIfNotExists()(startVoiceCommandsAction);
// // decorated = CreateVoiceStateIfNotExists()(decorated);
// export default decorated;
