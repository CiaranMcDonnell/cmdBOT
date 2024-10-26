const { SlashCommandBuilder, EmbedBuilder, version: discordVersion } = require('discord.js');
const { version } = require('../../../package.json');
const os = require('os');

module.exports = {
  category: 'General',
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Displays detailed information about the bot'),

  async execute(interaction) {
    // Calculate uptime
    const uptime = formatUptime(interaction.client.uptime);
        
    // Calculate memory usage
    const memoryUsage = process.memoryUsage();
    const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMemory = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    // Get guild count
    const guildCount = interaction.client.guilds.cache.size;

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('📊 cmdBOT Information')
      .setColor('#0099ff')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        // Bot Information
        {
          name: '🤖 Bot Stats',
          value: [
            `**Servers:** ${guildCount}`,
            `**Version:** v${version}`,
            `**Discord.js:** v${discordVersion}`,
            `**Node.js:** ${process.version}`,
          ].join('\n'),
          inline: true,
        },
        // System Information
        {
          name: '💻 System',
          value: [
            `**Platform:** ${os.platform()}`,
            `**Uptime:** ${uptime}`,
            `**Memory:** ${usedMemory}MB used`,
            `**CPU:** ${os.cpus()[0].model}`,
          ].join('\n'),
          inline: true,
        },
        // Add spacer for 2-column layout
        { name: '\u200b', value: '\u200b', inline: true },
        // Links and Support
        {
          name: '🔗 Links',
          value: [
            '**[Invite Bot](https://discord.com/oauth2/authorize)**',
          ].join(' • '),
          inline: false,
        },
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    // Send performance metrics in a separate field
    if (interaction.member.permissions.has('Administrator')) {
      embed.addFields({
        name: '📈 Performance Metrics',
        value: [
          `**Memory Usage:** ${usedMemory}MB / ${totalMemory}GB`,
          `**Free System Memory:** ${freeMemory}GB`,
          `**Ping:** ${interaction.client.ws.ping}ms`,
          `**API Latency:** ${Date.now() - interaction.createdTimestamp}ms`,
        ].join('\n'),
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) {
    parts.push(`${days}d`); 
  }
  if (hours > 0) {
    parts.push(`${hours}h`); 
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`); 
  }
  if (seconds > 0) {
    parts.push(`${seconds}s`); 
  }

  return parts.join(' ') || '0s';
}