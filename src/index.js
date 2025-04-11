const { 
    Client, 
    GatewayIntentBits, 
    Collection 
} = require('discord.js');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildScheduledEvents
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER']
});

client.antilinkEnabled = false;

const keepAlive = require(path.join(__dirname, '../server.js'));
client.commands = new Collection();

const functionsPath = path.join(__dirname, 'functions');
const eventsPath = path.join(__dirname, 'events');

const functions = fs.readdirSync(functionsPath).filter(file => file.endsWith(".js"));

(async () => {
    for (const file of functions) {
        require(path.join(functionsPath, file))(client);
    }

    await client.handleEvents(null, eventsPath);

    client.once('ready', async () => {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(commandsPath);
        await client.handleCommands(commandFolders, commandsPath);
        console.log(`✅ Logged in as ${client.user.tag}`);
    });

    keepAlive();
    client.login(process.env.TOKEN);
})();
