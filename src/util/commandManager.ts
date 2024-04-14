import { Command } from 'commands/Command';
import { Client, Guild, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { env } from './env';
import Macro from 'models/Macro';

export const commands = {};
export const commandNames = readdirSync(join(__dirname, '../commands/')).filter((el) => {
    console.log(el);
    const extension = '.ts';
    return el != `Command${extension}` && el.endsWith(extension);
});
export async function refreshMacros(guild: Guild) {
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    const macros = await Macro.find({ guildId: guild.id });

    let registeredCommands = macros
        .map((el) => {
            console.log(el);
            return new SlashCommandBuilder()
            .setName(el.name)
            .setDescription('View the current playlist').toJSON()
            ;
        });

    await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, guild.id), { body: registeredCommands });
}
export async function registerCommands() {
    for (let commandName of commandNames) {
        const command: Command = (await import(`../commands/${commandName}`)).default;
        if (!command) continue;
        commands[command.commandName] = command;
    }
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    let registeredCommands = Object.values(commands)
        .filter((el: Command) => el.slashCommand)
        .map((el: Command) => {
            console.log(el);
            return el.slashCommand.toJSON();
        });

    console.log(registeredCommands);
    // await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: [] });

    // console.log('cleared');
    await rest.put(Routes.applicationCommands(env.CLIENT_ID), {
        body: registeredCommands,
    });
    console.log('populated');
    // console.log(res);
}
