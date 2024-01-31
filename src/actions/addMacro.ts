import { Message, EmbedBuilder } from 'discord.js';
import { Action, ActionContext, SlashAction, SlashActionContext } from './types';
import * as States from '@util/state';
import { handleQueueCommand } from '@util/audio';
import {
    ClearIfNoVoiceConnection,
    CreateMessageStateIfNotExists,
    CreateVoiceStateIfNotExists,
    RequiresSameVoiceChannel,
} from '@util/decorators';
const MacroModel = require("../models/macro")
const linkRegex =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/;

const addMacroAction: SlashAction = async function ({ interaction,args,guild }: SlashActionContext) {
    try {
        let name = interaction.options.getString("name")
        let link = interaction.options.getString("link")

        // check name
        if (!name.match(/^[a-z0-9]+$/i)) {
            return interaction.editReply("Macro name is invalid")
        }

        // check link
        if (!link.match(linkRegex)) {
            return interaction.editReply("The link provided is invalid")
        }
        
        // check if it exists
        let macroInfo = await MacroModel.findOne({ name })
        if (macroInfo) {
            if (macroInfo.link == link) {
                return interaction.editReply(`\`${name}\` already exists`)
            }
            macroInfo.link = link
            await macroInfo.save()
            return interaction.editReply(`\`${name}\` updated with new link`)
        }

        // add since it doesnt exist at this point
        macroInfo = new MacroModel({
            name: name,
            link: link
        })
        await macroInfo.save()
        return interaction.editReply(`\`${name}\` has been added`)

    } catch (err) {
        return interaction.editReply("Unable to add macro. Don't try again I hate you.")
    }
}

export const actionName = "addmacro";
export const type = "action";
export default addMacroAction;