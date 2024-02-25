import dotenv from 'dotenv';
dotenv.config();

import { Client, GatewayIntentBits, messageLink } from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ],
});

client.login(process.env.DISCORD_TOKEN);

client.on("messageCreate", async (message) => {
    console.log(message);

    if (!message?.author.bot) {
        if (message.content === "ping") {
            message.reply("pong");
        }
    }
});