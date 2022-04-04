import { Command, ExecuteFunction } from './Command';
import { Message } from 'discord.js';
import { voiceCommandState, VoiceState, voiceState } from '@util/state';
import { CreateVoiceCommandStateIfNotExists, CreateVoiceStateIfNotExists } from '@util/decorators';
import { EndBehaviorType, getVoiceConnection, joinVoiceChannel } from '@discordjs/voice';
import * as fs from 'fs';
import * as path from 'path';
import * as prism from 'prism-media';
import { OpusEncoder } from '@discordjs/opus';
class StartVoiceCommands extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'startvoicecommands',
        });
    }
    @CreateVoiceCommandStateIfNotExists()
    @CreateVoiceStateIfNotExists()
    async executeFunction(message: Message, fn: () => void = null) {
        super.executeFunction(message, fn);
        const { guild } = this;

        const memberVoiceChannel = message.member.voice.channel;
        if (!memberVoiceChannel) return message.reply('Please enter a voice channel!');
        if (!memberVoiceChannel.joinable)
            return message.reply(
                'I do not have sufficient permissions to join this voice channel!',
            );
        let voiceConnection = getVoiceConnection(guild.id);
        if (!voiceConnection) {
            voiceConnection = await joinVoiceChannel({
                channelId: memberVoiceChannel.id,
                guildId: guild.id,
                adapterCreator: memberVoiceChannel.guild.voiceAdapterCreator as any,
                selfDeaf: false,
            });
        }

        voiceConnection.receiver.speaking.on('start', (id) => {
            if (!voiceCommandState[guild.id].members[id]) {
                console.log('subscribing', id);
                const subscription = voiceConnection.receiver.subscribe(id, {
                    end: { behavior: EndBehaviorType.Manual },
                    objectMode: true,
                });

                voiceCommandState[guild.id].members[id] = {
                    packets: subscription,
                    time: Date.now(),
                };
                subscription.pipe(fs.createWriteStream(`${id}_out.OPUS`));
            }
            voiceCommandState[guild.id].members[id].time = Date.now();

            console.log(`${id} Started speaking`);
        });
        voiceConnection.receiver.speaking.on('end', (id) => {
            // voiceConnection.receiver.subscribe(id, { mode: 'pcm' });
            console.log(`${id} Stopped speaking`);
            //Wait 2 seconds. If time is greater than 2 seconds, destroy and delete state.
            setTimeout(function () {
                let state = voiceCommandState[guild.id].members[id];
                if (Date.now() - state.time >= 2000) {
                    //End capture
                    console.log('writing');
                    let buff = [];
                    let fullBuffer: Buffer;

                    setTimeout(function () {
                        state.packets.destroy();
                    }, 3000);

                    console.log();

                    delete voiceCommandState[guild.id].members[id];
                }
            }, 2000);
        });
        return;
    }
}
export default new StartVoiceCommands();
