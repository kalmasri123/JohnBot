import { getCharacters } from '@util/anilist';
import { CreateMessageStateIfNotExists } from '@util/decorators';
import { getRandomInt } from '@util/helpers';
import { FollowupCommand, deleteMessageState, messageState } from '@util/state';
import { Message, EmbedBuilder, TextChannel } from 'discord.js';
import stringSimilarity from 'string-similarity-js';
import { Action, BotAction, ActionContext, ActionSuccess, ActionFailure } from './types';
interface CharacterActionContext extends ActionContext {
    textChannel: TextChannel;
}
const characterAction: BotAction = async function ({ textChannel,guild }: CharacterActionContext) {
    const page = getRandomInt(0, 10);
    try {
        let characterList = await getCharacters(page);
        let charIndex = getRandomInt(0, characterList.length - 1);

        let character = characterList[charIndex];
        const embed = new EmbedBuilder()
            .setColor('#FFFFFF')
            .setImage(character.image)
            .setTitle('Guess the Character')
            .setTimestamp(Date.now());

        async function callback(this: FollowupCommand, message: Message, fn: () => void = null) {
            // if (message.author != this.originalInteraction.member.user) return;
            switch (message.content.trim().toLowerCase()) {
                case 'end':
                    if (deleteMessageState(message.guild.id, message.channelId, 'character')) {
                        message.reply(
                            `Successfully Ended\nThe correct Character is ${
                                this.data.character.fullName
                            } ${
                                this.data.character.origin
                                    ? `from **${this.data.character.origin}**`
                                    : ''
                            }`,
                        );
                        return;
                    }
                    break;
            }
            let isMatch = character.names.some(
                (el) =>
                    el &&
                    stringSimilarity(el.toString().toLowerCase(), message.content.toLowerCase()) >=
                        0.8,
            );
            if (!isMatch) {
                this.data.tries--;
                if (this.data.tries == 0) {
                    message.reply(
                        `No more tries!\nCorrect Name was ${character.fullName} ${
                            this.data.character.origin
                                ? `from **${this.data.character.origin}**`
                                : ''
                        }`,
                    );
                    return true;
                }
                message.react('❌');
                // message.reply(`Incorrect! Tries left: ${this.data.tries}`);
                return false;
            }
            message.reply(
                `Correct!\nThe character's name was ${character.fullName} ${
                    this.data.character.origin ? `from **${this.data.character.origin}**` : ''
                }`,
            );
            return true;
        }
        messageState[guild.id][textChannel.id] = {
            data: { tries: 5, character },
            tag: 'character',
            callback,
            // originalInteraction: interaction,
        };
        return ActionSuccess(embed);
    } catch (err) {
        console.error(err);
        return ActionFailure('An error has occurred communicating with the server');
    }
};
export const actionName = 'character';
export const type = 'action';
let decorated: BotAction = CreateMessageStateIfNotExists()(characterAction);
export default decorated;
