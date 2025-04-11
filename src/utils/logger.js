const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir);
        }
    }

    getCurrentLogFile() {
        const date = new Date();
        const fileName = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
        return path.join(this.logsDir, fileName);
    }

    formatMessage(type, message) {
        const date = new Date();
        const timestamp = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        return `[${timestamp}] [${type}] ${message}\n`;
    }

    async log(type, message) {
        const formattedMessage = this.formatMessage(type, message);
        const logFile = this.getCurrentLogFile();

        try {
            await fs.promises.appendFile(logFile, formattedMessage, 'utf8');
            console.log(formattedMessage.trim());
        } catch (error) {
            console.error('Erreur lors de l\'écriture des logs:', error);
        }
    }

    async logMessage(message) {
        const content = message.content.replace(/\n/g, ' ');
        const logMessage = `${message.author.tag} dans #${message.channel.name}: ${content}`;
        
        // Si le message contient des pièces jointes
        if (message.attachments.size > 0) {
            const attachments = Array.from(message.attachments.values())
                .map(a => a.url)
                .join(', ');
            await this.log('MESSAGE+FICHIER', `${logMessage} [Fichiers: ${attachments}]`);
        } else {
            await this.log('MESSAGE', logMessage);
        }

        // Si le message est une réponse à un autre message
        if (message.reference) {
            try {
                const repliedTo = await message.channel.messages.fetch(message.reference.messageId);
                const replyContent = repliedTo.content.replace(/\n/g, ' ');
                await this.log('RÉPONSE', `↳ En réponse à ${repliedTo.author.tag}: ${replyContent}`);
            } catch (error) {
                console.error('Erreur lors de la récupération du message de réponse:', error);
            }
        }
    }

    async logEdit(oldMessage, newMessage) {
        if (oldMessage.content === newMessage.content) return;
        
        const oldContent = oldMessage.content.replace(/\n/g, ' ');
        const newContent = newMessage.content.replace(/\n/g, ' ');
        await this.log('ÉDITION', `${oldMessage.author.tag} a modifié dans #${oldMessage.channel.name}:`);
        await this.log('ANCIEN', oldContent);
        await this.log('NOUVEAU', newContent);
    }

    async logDelete(message) {
        const content = message.content.replace(/\n/g, ' ');
        await this.log('SUPPRESSION', `Message de ${message.author.tag} supprimé dans #${message.channel.name}: ${content}`);
    }
}

module.exports = new Logger();
