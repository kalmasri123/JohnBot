import { Command } from 'commands/Command';
import { ChatInputCommandInteraction, Interaction, Message, SlashCommandBuilder } from 'discord.js';
import playAction from 'actions/play';
import { Client, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { env } from './env';
const MacroModel = require("../models/macro")
export const commands = {};
export const commandNames = readdirSync(join(__dirname, '../commands/')).filter((el) => {
    console.log(el);
    const extension = '.ts';
    return el != `Command${extension}` && el.endsWith(extension);
});

export async function registerCommands(client: Client) {
    for (let commandName of commandNames) {
        const command: Command = (await import(`../commands/${commandName}`)).default;
        commands[command.commandName] = command;
    }

    // add commands from database
    let macros = await MacroModel.find({})
    for (let macro of macros) {
        class PlayMacro extends Command {
            constructor() {
                super({
                    minArgs: 0,
                    commandName: macro.name,
                    slashCommand: new SlashCommandBuilder()
                        .setName(macro.name)
                        .setDescription(`plays ${macro.link}`)
        
                });
            }
            async executeFunction(message: Message, fn: () => void = null) {
                super.executeFunction(message, fn);
                // playAction(this, fn);
            }
            async executeCommand(interaction: ChatInputCommandInteraction, fn: () => void = null) {
                await super.executeCommand(interaction, fn);
                const args = [macro.link]
                playAction({interaction,guild:interaction.guild,args}, fn);
            }
        }
        commands[macro.name] = new PlayMacro();
    }

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    let registeredCommands = Object.values(commands)
        .filter((el: Command) => el.slashCommand)
        .map((el: Command) => {
            return el.slashCommand.toJSON();
        });
    console.log(registeredCommands)
    // await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: [] });

    // await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, guild.id), { body: [] });
    // console.log('cleared');
    await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
        body: registeredCommands,
    });
    console.log('populated');
    // console.log(res);
}
