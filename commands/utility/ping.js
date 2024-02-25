const { SlashCommandBuilder } = require('discord.js');
const dotenv = require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};