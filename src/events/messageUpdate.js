const logger = require('../utils/logger');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        // Ignorer les messages des bots
        if (oldMessage.author.bot) return;
        
        // Logger la modification
        await logger.logEdit(oldMessage, newMessage);
    }
};
