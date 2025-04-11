const logger = require('../utils/logger');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // Ignorer les messages des bots
        if (message.author?.bot) return;
        
        // Logger la suppression
        await logger.logDelete(message);
    }
};
