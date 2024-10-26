const dotenv = require('dotenv');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('Missing required environment variables (DISCORD_TOKEN, CLIENT_ID)');
  process.exit(1);
}

async function deployCommands() {
  try {
    // Array to store commands
    const commands = [];
        
    // Path to commands directory
    const commandsPath = path.join(__dirname, '../commands');

    // Check if commands directory exists
    if (!fs.existsSync(commandsPath)) {
      console.error('Commands directory not found!');
      console.log('Creating commands directory...');
      fs.mkdirSync(commandsPath);
      console.log('Please add command files to the commands directory and try again.');
      process.exit(1);
    }

    // Read command folders (general and utils)
    const commandFolders = fs.readdirSync(commandsPath);

    if (commandFolders.length === 0) {
      console.log('No command folders found in commands directory!');
      process.exit(1);
    }

    console.log(`Found ${commandFolders.length} command folders...`);

    // Loop through each folder
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      
      // Skip if not a directory
      if (!fs.statSync(folderPath).isDirectory()) {
        continue; 
      }
      
      // Read command files in the folder
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
      
      console.log(`Loading ${commandFiles.length} commands from ${folder}...`);

      // Load each command file
      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
                
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON());
          console.log(`Loaded command: ${command.data.name} from ${folder}`);
        } else {
          console.warn(`Warning: Command at ${filePath} is missing required "data" or "execute" property.`);
        }
      }
    }

    if (commands.length === 0) {
      console.log('No valid commands found!');
      process.exit(1);
    }

    // Initialize REST client
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    console.log('Starting to deploy slash commands...');

    // Register commands
    if (process.env.GUILD_ID) {
      // Server specific deployment
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
      console.log(`Successfully deployed ${commands.length} guild commands for guild ${process.env.GUILD_ID}`);
    } else {
      // Global deployment
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
      console.log(`Successfully deployed ${commands.length} global commands`);
    }

  } catch (error) {
    console.error('Error while deploying commands:', error);
    process.exit(1);
  }
}

// Execute registration
deployCommands();