import { getCharacters } from '@util/anilist';
import { getRandomInt } from '@util/helpers';
import { Message, MessageEmbed } from 'discord.js';
import { Command } from './Command';
import { stringSimilarity } from 'string-similarity-js';
import { deleteMessageState, messageState } from '@util/state';
import { CreateMessageStateIfNotExists } from '@util/decorators';
class SearchCommand extends Command {
    constructor() {
        super({
            minArgs: 1,
            commandName: 'character',
        });
    }
    @CreateMessageStateIfNotExists()
    async executeFunction(message: Message<boolean>, fn: () => void): Promise<void> {
        super.executeFunction(message, fn);

        const page = getRandomInt(0, 10);
        try {
            let characterList = await getCharacters(page);
            let charIndex = getRandomInt(0, characterList.length - 1);

            let character = characterList[charIndex];
            console.log(character);
            const embed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setImage(character.image)
                .setTitle('Guess the Character')
                .setTimestamp(Date.now());
            message.reply({ embeds: [embed] });

            async function callback(message: Message, fn: () => void = null) {
                if (message.author != this.originalMessage.author) return;
                switch(message.content.trim().toLowerCase()){
                    case "end":
                        if (deleteMessageState(message.guild.id, message.author.id, 'character')) {
                            message.reply(
                                `Successfully Ended\nThe correct Character is ${this.data.character.fullName} ${this.data.character.origin? `from **${this.data.character.origin}**`:""}`,
                            );
                            return;
                        }
                        break;
                }
                let isMatch = character.names.some(
                    (el) =>
                        el &&
                        stringSimilarity(
                            el.toString().toLowerCase(),
                            message.content.toLowerCase(),
                        ) >= 0.8,
                );
                if (!isMatch) {
                    this.data.tries--;
                    if (this.data.tries == 0) {
                        message.reply(
                            `No more tries!\nCorrect Name was ${character.fullName} ${this.data.character.origin? `from **${this.data.character.origin}**`:""}`,
                        );
                        return true;
                    }
                    message.react('❌');
                    // message.reply(`Incorrect! Tries left: ${this.data.tries}`);
                    return false;
                }
                message.reply(
                    `Correct!\nThe character's name was ${character.fullName} ${this.data.character.origin? `from **${this.data.character.origin}**`:""}`,
                );
                return true;
            }
            messageState[message.guild.id][message.author.id] = {
                data: { tries: 5, character },
                tag: 'character',
                callback,
                originalMessage: message,
            };
        } catch (err) {
            console.error(err);
            message.reply('An error has occurred communicating with the server');
        }
    }
}
export default new SearchCommand();
