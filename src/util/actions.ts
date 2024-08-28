import { readdirSync } from 'fs';
import { join } from 'path';

const actionNames = readdirSync(join(__dirname, '../actions/')).filter((el) => {
    const extension = process.env.ENV == 'DEBUG' ? '.ts' : '.js';
    console.log("ACTIONS",el,extension)
    return (el.endsWith(".js") || el.endsWith(".ts")) && !el.includes('types');
});
export const actions = {};
export const actionList = []
actionNames.map(async (actionName) => {
    const action = await import(`../actions/${actionName}`);
    console.log(action)
    if (action.type == 'action') {
        actions[action.actionName] = action.default;
    }
    actionList.push(action.actionName)
});
