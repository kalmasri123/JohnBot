import { BotAction } from 'actions/types';
import playAction from 'actions/play';
import resumeAction from 'actions/resume';

interface ActionMacro {
    actionName: string;
    botAction: BotAction;
    argMap: { [key: string]: string };
}
export const ValidMacros: ActionMacro[] = [
    {
        actionName: 'play',
        botAction: playAction,
        argMap: { link: 'link' },
    },
    {
        actionName: 'resume',
        botAction: resumeAction,
        argMap: {},
    },
];
