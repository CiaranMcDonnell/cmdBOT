# cmdBOT- General Purpose Discord Bot

This bot is a general-purpose Discord bot, the reason I made it was to basically learn API interactions and JavaScript, initially was hosted on a Google Cloud VM Instance but I've since moved it to a Rasperry Pi 5 Self Host, hoping to add some more features when I have free time.

## 🌟 Features

- **Dynamic Responses**: Support for text, embeds, and dynamic content
- **Command Categories**: Organize commands into categories for better management

## 📋 Commands

### General Commands

- `/help` - Display all available categories and the commands inside them
- `/ping` - Check bot latency
- `/info` - Show bot information

## 🚀 Getting Started

1. **Invite the Bot**

   - Use [this invite link](https://discord.com/oauth2/authorize?client_id=1211322858081615933) to add cmdBOT to your server
   - Ensure the bot has appropriate permission

2. **Verify Installation**

   ```bash
   # Test the bot
   /ping
   ```

## 🛠️ Self-Hosting

### Prerequisites

- Node.js v16.9.0 or higher
- Discord.js v14

### Installation

```bash
# Clone the repository
git clone https://github.com/ciaranmcdonnell/cmdbot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your tokens and settings

# Start the bot
npm start
```
