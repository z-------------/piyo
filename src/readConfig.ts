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

import * as fs from "fs";

export interface Config {
    token: string;
    clientId: string;
    guildIds: string[];
    plugins: string[];
}

export default function readConfig(filename: string): Config {
    const data = fs.readFileSync(filename, "utf-8");
    return JSON.parse(data);
}
