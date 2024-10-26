const dotenv = require('dotenv');
const { Client, Collection, Events, IntentsBitField, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');

dotenv.config();

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in environment variables');
  process.exit(1);
}

class cmdBOT {
  constructor() {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
    });

    this.commands = new Collection();
    this.cooldowns = new Collection();
    this.startTimestamp = Date.now();
  }

  // Load command files from commands directory
  loadCommands() {
    try {
      const commandsPath = path.join(__dirname, 'commands');
            
      if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        console.log('Created commands directory');
        return;
      }

      // Read command categories (folders)
      const commandFolders = fs.readdirSync(commandsPath);
      console.log(`Found ${commandFolders.length} command categories`);

      for (const folder of commandFolders) {
        const categoryPath = path.join(commandsPath, folder);
        
        // Skip if not a directory
        if (!fs.statSync(categoryPath).isDirectory()) {
          continue; 
        }

        // Read command files in the category
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        console.log(`Loading ${commandFiles.length} commands from ${folder}`);

        for (const file of commandFiles) {
          const filePath = path.join(categoryPath, file);
          const command = require(filePath);

          if ('data' in command && 'execute' in command) {
            command.category = folder; // Set the category based on folder name
            this.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name} (${folder})`);
          } else {
            console.warn(`Warning: Command at ${filePath} is missing required "data" or "execute" property.`);
          }
        }
      }
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  }

  setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`Bot is ready as: ${this.client.user.tag}`);
      console.log(`Serving ${this.client.guilds.cache.size} servers`);
      this.updatePresence();
      setInterval(() => this.updatePresence(), 5 * 60 * 1000);
    });

    this.client.on('error', error => {
      console.error('Discord client error:', error);
    });

    this.client.on(Events.GuildCreate, guild => {
      console.log(`Joined new guild: ${guild.name} (id: ${guild.id})`);
      this.updatePresence();
    });

    this.client.on(Events.GuildDelete, guild => {
      console.log(`Removed from guild: ${guild.name} (id: ${guild.id})`);
      this.updatePresence();
    });

    this.client.on(Events.InteractionCreate, this.handleInteraction.bind(this));
  }
  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) {
      return; 
    }

    const command = this.commands.get(interaction.commandName);
    if (!command) {
      return; 
    }

    // Add this line to attach the commands collection to the interaction.client
    interaction.client.commands = this.commands;

    // Check permissions
    const botMember = interaction.guild?.members.cache.get(this.client.user.id);
    if (botMember && command.requiredPermissions) {
      const missingPermissions = botMember.permissions.missing(command.requiredPermissions);
      if (missingPermissions.length) {
        await interaction.reply({
          content: `I need the following permissions to execute this command: ${missingPermissions.join(', ')}`,
          ephemeral: true,
        });
        return;
      }
    }

    // Cooldown check
    if (!this.checkCooldown(interaction, command)) {
      return; 
    }

    try {
      await command.execute(interaction, this.client);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      const errorMessage = {
        content: 'There was an error while executing this command!',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  }

  checkCooldown(interaction, command) {
    if (!this.cooldowns.has(command.data.name)) {
      this.cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        interaction.reply({
          content: `Please wait ${timeLeft.toFixed(1)} more seconds before using the \`${command.data.name}\` command.`,
          ephemeral: true,
        });
        return false;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    return true;
  }

  updatePresence() {
    const uptimeHours = ((Date.now() - this.startTimestamp) / 1000 / 60 / 60).toFixed(1);
        
    this.client.user.setActivity(`${uptimeHours}h uptime`, {
      type: ActivityType.Listening,
    });
  }

  async start() {
    try {
      console.log('Starting bot...');
      this.loadCommands();
      this.setupEventHandlers();
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      console.error('Failed to start bot:', error);
      process.exit(1);
    }
  }
}

const bot = new cmdBOT();
bot.start();

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('Bot is shutting down...');
  bot.client.destroy();
  process.exit(0);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  bot.client.destroy();
  process.exit(1);
});

module.exports = cmdBOT;