const dotenv = require('dotenv').config();
dotenv.config();
const { SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');


const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    }
];

const rest = new REST({ version: '10'}).setToken(process.env.DISCORD_TOKEN);
(async () => {
    console.log('Registering slash commands...')
    try{
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        ),
        console.log('Successfully registered commands!'
        )
    } catch (error) {
        console.log('Error while registering commands: $(error)');
    }
})();