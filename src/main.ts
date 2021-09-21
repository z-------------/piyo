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

import getToken from "./getToken";
import * as path from "path";
import { Client, Intents, TextBasedChannels, Message } from "discord.js";
import Plugin from "./plugin";

const COMMAND_PREFIX = "!p";

/* types */

enum PluginLoadResult {
    Success,
    Fail,
}

/* globals */

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
});

const plugins: Map<string, Plugin> = new Map();

/* event listeners */

client.once("ready", () => {
	console.log(`Ready as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(COMMAND_PREFIX)) return;

    const argv = message.content.trim().split(/\s+/g);
    const cmd = argv[0].slice(COMMAND_PREFIX.length).toLowerCase();
    const args = argv.slice(1);

    if (!plugins.has(cmd)) {
        return;
    }
    const plugin = plugins.get(cmd);

    console.log(`(channelId: "${message.channelId}", guildId: "${message.guildId})"`, cmd, args);
});

/* helpers */

function loadPlugin(qualifiedName: string): Plugin | null {
    try {
        const pluginsDir = path.join(__dirname, "..", "plugin");
        const pluginPathFragment = path.join(...qualifiedName.split("/"));
        const pluginPath = path.join(pluginsDir, pluginPathFragment);
        const pluginPackageJson = require(path.join(pluginPath, "package.json"));
        const pluginMainName = pluginPackageJson.main;
        const plugin = require(path.join(pluginPath, pluginMainName));
        return plugin;
    } catch (exp) {
        console.error(exp);
        return null;
    }
}

/* main */

client.login(getToken());
