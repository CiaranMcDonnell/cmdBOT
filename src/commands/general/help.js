const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { categories } = require('../../utils/categories.js');

module.exports = {
  category: 'General',
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Specific category of commands to show')
        .setRequired(false)
        .addChoices(
          ...Object.entries(categories).map(([key, category]) => ({
            name: category.name,
            value: key.toLowerCase(),
          })),
        ),
    ),

  async execute(interaction) {
    try {
      // Access commands from the client
      const commands = interaction.client.commands;
      
      // Simpler check for commands
      if (!commands || commands.size === 0) {
        throw new Error('No commands available');
      }

      const commandsByCategory = new Map();

      // Group commands by category
      commands.forEach(command => {
        const category = command.category?.toUpperCase() || 'UNCATEGORIZED';
        if (!commandsByCategory.has(category)) {
          commandsByCategory.set(category, []);
        }
        commandsByCategory.get(category).push({
          name: command.data.name,
          description: command.data.description,
        });
      });

      const requestedCategory = interaction.options.getString('category')?.toUpperCase();
      
      if (requestedCategory) {
        return await sendCategoryHelp(interaction, requestedCategory, commandsByCategory);
      } 
      return await sendOverviewHelp(interaction, commandsByCategory);
      
    } catch (error) {
      console.error('Error in help command:', error);
      await interaction.reply({ 
        content: 'There was an error loading the commands. Please try again later.', 
        ephemeral: true, 
      });
    }
  },
};

async function sendCategoryHelp(interaction, categoryKey, commandsByCategory) {
  const category = categories[categoryKey];
  const commands = commandsByCategory.get(categoryKey);
  
  if (!category || !commands) {
    await interaction.reply({
      content: 'Invalid category specified.',
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(`${category.emoji} ${category.name} Commands`)
    .setColor('#0099ff')
    .setDescription(category.description)
    .setTimestamp();

  commands.forEach(cmd => {
    embed.addFields({
      name: `/${cmd.name}`,
      value: cmd.description,
    });
  });

  await interaction.reply({ embeds: [embed] });
}

async function sendOverviewHelp(interaction, commandsByCategory) {
  const embed = new EmbedBuilder()
    .setTitle('📚 Command Help')
    .setColor('#0099ff')
    .setDescription('Use `/help <category>` for detailed information about specific categories.')
    .setTimestamp()
    .setFooter({ 
      text: 'Tip: Click a command to copy it',
      iconURL: interaction.client.user.displayAvatarURL(),
    });

  for (const [categoryKey, commands] of commandsByCategory) {
    const category = categories[categoryKey] || {
      name: 'Uncategorized',
      emoji: '📎',
      description: 'Miscellaneous commands',
    };

    const commandList = commands
      .map(cmd => `\`/${cmd.name}\``)
      .join('\n');
            
    embed.addFields({
      name: `${category.emoji} ${category.name}`,
      value: commandList || 'No commands available',
      inline: true,
    });
  }

  await interaction.reply({ embeds: [embed] });
}