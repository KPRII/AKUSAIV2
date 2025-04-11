const logger = require('../utils/logger');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignorer les messages des bots
        if (message.author.bot) return;
        
        // Logger le message
        await logger.logMessage(message);
    }
};
