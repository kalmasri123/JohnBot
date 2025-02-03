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
import { transcribe } from '@util/transcribe';
export interface StartVoiceCommandsActionContext extends ActionContext {
    voiceChannel: VoiceChannel;
}
const client = new speech.SpeechClient();

const startVoiceCommandsAction: BotAction = async function ({
    guild,
    voiceChannel,
}: StartVoiceCommandsActionContext) {
    
    return ActionSuccess('Connected');
};
export const actionName = 'startvoicecommands';
export const type = 'action';
let decorated = startVoiceCommandsAction;
decorated = CreateVoiceCommandStateIfNotExists()(startVoiceCommandsAction);
decorated = CreateVoiceStateIfNotExists()(decorated);
export default decorated;
