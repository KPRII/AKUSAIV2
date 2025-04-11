const { PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../../src/config/antibadwords.json');

// Liste de gros mots à surveiller
const badWords = [
    "merde", "putain", "con", "connard", "salaud", "salop", "enfoiré", "bordel", 
    "enculé", "pute", "bâtard", "chiotte", "bite", "couille", "foutre", "cul"
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('antibadwords')
        .setDescription('Active ou désactive le système anti-gros mots')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

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
                content: `✅ Le système Anti-Gros Mots est maintenant **${!isCurrentlyEnabled ? 'activé' : 'désactivé'}**`,
                ephemeral: true
            });

            // Log l'action
            console.log(`[AntiBadWords] ${interaction.user.tag} a ${!isCurrentlyEnabled ? 'activé' : 'désactivé'} l'antibadwords dans ${guild.name}`);
        } catch (error) {
            console.error('Erreur dans la commande antibadwords:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                ephemeral: true
            });
        }
    }
};
