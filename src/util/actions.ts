import { readdirSync } from 'fs';
import { join } from 'path';

const actionNames = readdirSync(join(__dirname, '../actions/')).filter((el) => {
    const extension = process.env.ENV == 'DEBUG' ? '.ts' : '.js';
    return el.endsWith(extension) && !el.includes('types');
});
export const actions = {};

actionNames.map(async (actionName) => {
    const action = await import(`../actions/${actionName}`);
    if (action.type == 'action') {
        actions[action.actionName] = action.default;
    }
});
