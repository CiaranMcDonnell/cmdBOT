const dotenv = require('dotenv');
dotenv.config();

const { Client, Intents, IntentsBitField } = require('discord.js');
const internal = require('stream');

const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ] 
});

client.login(process.env.DISCORD_TOKEN);

client.on('ready', () => {
    console.log(`Bot is ready as: ${client.user.tag}`);
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'ping') {
        interaction.reply('Pong!');
    }
});
