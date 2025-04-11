const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.configPath = path.join(__dirname, '../../config.json');
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(data);
            }
            return { guilds: {} };
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
            return { guilds: {} };
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la configuration:', error);
        }
    }

    setGuildConfig(guildId, config) {
        if (!this.config.guilds) {
            this.config.guilds = {};
        }
        this.config.guilds[guildId] = config;
        this.saveConfig();
    }

    getGuildConfig(guildId) {
        return this.config.guilds?.[guildId] || null;
    }
}

module.exports = new ConfigManager();
