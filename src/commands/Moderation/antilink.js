const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../../src/config/antilink.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antilink')
        .setDescription("Active ou désactive l'anti-lien sur le serveur")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const { guild } = interaction;

            // Charger la configuration
            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }

            // Inverser l'état actuel
            const isCurrentlyEnabled = config[guild.id]?.enabled === true;
            
            config[guild.id] = {
                enabled: !isCurrentlyEnabled,
                updatedAt: new Date().toISOString(),
                updatedBy: interaction.user.id
            };

            // Sauvegarder la configuration
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

            // Répondre à l'utilisateur
            await interaction.reply({
                content: `✅ Le système Anti-Link est maintenant **${!isCurrentlyEnabled ? 'activé' : 'désactivé'}**`,
                ephemeral: true
            });

            // Log l'action
            console.log(`[AntiLink] ${interaction.user.tag} a ${!isCurrentlyEnabled ? 'activé' : 'désactivé'} l'antilink dans ${guild.name}`);
        } catch (error) {
            console.error('Erreur dans la commande antilink:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                ephemeral: true
            });
        }
    }
};
