import Macro from 'models/Macro';
import { ActionContext, ActionFailure, ActionSuccess, BotAction } from './types';
import { refreshMacros, registerCommands } from '@util/commandManager';
export interface MacroAddActionContext extends ActionContext {
    macroName: string;
    action: string;
    args: { [key: string]: string };
}
export const macroAddAction: BotAction = async function ({
    guild,
    macroName,
    action,
    args,
}: MacroAddActionContext) {
    let macro = await Macro.findOne({ guildId: guild.id, name: macroName });
    if (macro) return ActionFailure('Already exists');
    console.log(args)
    macro = await Macro.create({ guildId: guild.id, name: macroName, action, args });
    await macro.save();
    await refreshMacros(guild)

    return ActionSuccess('Added');
};
export const actionName = 'playlist';
export const type = 'action';
