import { Command } from "commands/Command";
import { Client, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { env } from "./env";

export const commands = {};
export const commandNames = readdirSync(join(__dirname, '../commands/')).filter((el) => {
    console.log(el);
    const extension = process.env.ENV == 'DEBUG' ? '.ts' : '.js';
    return el != `Command${extension}` && el.endsWith(extension);
});

export async function registerCommands(client:Client) {
    for (let commandName of commandNames) {
        const command: Command = (await import(`../commands/${commandName}`)).default;
        commands[command.commandName] = command;
    }
    console.log(commands);
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    let registeredCommands = Object.values(commands)
        .filter((el: Command) => el.slashCommand)
        .map((el: Command) => {
            return el.slashCommand.toJSON() ;
        });
    (await client.guilds.fetch()).forEach(async guild=>{
        await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, guild.id), { body: [] })
        const res = await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, guild.id), {
            body: registeredCommands,
        });
    })

}