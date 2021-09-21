// Copyright (C) 2021 Zack Guard
// 
// This file is part of piyo.
// 
// piyo is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// piyo is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with piyo.  If not, see <http://www.gnu.org/licenses/>.

import * as path from "path";
import * as dotenv from "dotenv";
import { Client, Intents, TextBasedChannels, Message, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import Plugin from "./plugin";

/* globals */

dotenv.config();

const client = new Client({ intents: [ Intents.FLAGS.GUILDS ] });

const rest = new REST({ version: "9" }).setToken(process.env["TOKEN"]);

const plugins: Map<string, Plugin> = new Map();

const commands = [
    new SlashCommandBuilder()
        .setName("piyoping")
        .setDescription("Replies with piyopong"),
    new SlashCommandBuilder()
        .setName("p")
        .setDescription("Perform a query")
        .addStringOption(opt => opt.setName("plugin").setRequired(true).setDescription("Plugin name"))
        .addStringOption(opt => opt.setName("query").setDescription("Enter query")),
].map(command => command.toJSON());

/* event listeners */

client.once("ready", () => {
    console.log(`Ready as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    console.log({ commandName });

    if (commandName === "piyoping") {
        await interaction.reply("piyopong");
        return;
    } else if (commandName !== "p") {
        return;
    }

    const plugin = plugins.get(interaction.options.getString("plugin"));
    console.log(`Using plugin "${plugin.name}"`);
    try {
        console.log("query:", interaction.options.getString("query"));
        const args = interaction.options.getString("query") ?? "";
        const embed: MessageEmbed = await plugin.query(args.split(" "));
        await interaction.reply({ embeds: [ embed ] });
    } catch (exp) {
        console.error("Exception from plugin: ", exp);
        await interaction.reply(`Error from plugin "${plugin.name}"${exp.message ? `: ${exp.message}`: ""}`);
    }
});

/* helpers */

function loadPlugin(qualifiedName: string): Plugin | null {
    try {
        const pluginsDir = path.join(__dirname, "..", "plugin");
        const pluginPathFragment = path.join(...qualifiedName.split("/"));
        const pluginPath = path.join(pluginsDir, pluginPathFragment);
        const pluginPackageJson = require(path.join(pluginPath, "package.json"));
        const pluginMainName = pluginPackageJson.main;
        console.log(path.join(pluginPath, pluginMainName));
        const { plugin } = require(path.join(pluginPath, pluginMainName));
        console.log({ plugin });
        return plugin;
    } catch (exp) {
        console.error(exp);
        return null;
    }
}

async function registerCommands(commands: any[]): Promise<void> {
    for (const guildId of process.env["GUILDIDS"].split(",")) {
        try {
            await rest.put(
                Routes.applicationGuildCommands(process.env["CLIENTID"], guildId),
                { body: commands },
            );
        } catch (exp) {
            console.error(`Failed to register commands on guild ${guildId}:`, exp);
        }
    }
}

/* main */

(async () => {
    // we don't actually have to register guild commands every time
    const ps = await Promise.all(["z-------------/piyo-anilist"].map(loadPlugin));
    for (const plugin of ps) {
        if (plugin) {
            plugins.set(plugin.prefix, plugin);
            console.log(`loaded plugin "${plugin.name}"`);
        } else {
            console.warn("failed to load a plugin");
        }
    }

    await registerCommands(commands);

    client.login(process.env["TOKEN"]);
})();
