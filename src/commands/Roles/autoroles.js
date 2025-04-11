const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Liste des rôles à créer
const roles = {
    'role-fille': { name: 'Fille', color: '#ff69b4' },
    'role-garcon': { name: 'Garçon', color: '#4169e1' },
    'role-nonbinaire': { name: '🚁 de combat', color: '#9b59b6' },
    'level-1-25': { name: 'Niveau 1-25', color: '#98ff98' },
    'level-26-50': { name: 'Niveau 26-50', color: '#32cd32' },
    'level-51-75': { name: 'Niveau 51-75', color: '#228b22' },
    'level-76-101': { name: 'Niveau 76-101', color: '#ff69b4' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoroles')
        .setDescription('Crée le message pour les auto-rôles')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            // Créer les rôles s'ils n'existent pas
            for (const [id, roleInfo] of Object.entries(roles)) {
                let role = interaction.guild.roles.cache.find(r => r.name === roleInfo.name);
                if (!role) {
                    await interaction.guild.roles.create({
                        name: roleInfo.name,
                        color: roleInfo.color,
                        reason: 'Auto-rôle créé par la commande /autoroles'
                    });
                }
            }
            // Créer les boutons pour les genres
            const genreRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('role-fille')
                        .setLabel('Fille 🦋')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('role-garcon')
                        .setLabel('Garçon 🐝')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('role-nonbinaire')
                        .setLabel('🚁 de combat')
                        .setStyle(ButtonStyle.Primary)
                );

            // Créer les boutons pour les niveaux MSP
            const levelRow1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('level-1-25')
                        .setLabel('Niveau 1-25 🌱')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('level-26-50')
                        .setLabel('Niveau 26-50 🌿')
                        .setStyle(ButtonStyle.Secondary)
                );

            const levelRow2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('level-51-75')
                        .setLabel('Niveau 51-75 🌳')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('level-76-101')
                        .setLabel('Niveau 76-101 🌺')
                        .setStyle(ButtonStyle.Secondary)
                );

            // Message avec les instructions
            const message = `**Choisissez vos rôles !**

🎭 **Genre**
Cliquez sur un bouton pour obtenir le rôle correspondant à votre genre.

📊 **Niveau MSP**
Sélectionnez votre niveau sur MovieStarPlanet !

*Note : Vous pouvez changer vos rôles à tout moment.*`;

            // Envoyer le message avec les boutons
            await interaction.channel.send({
                content: message,
                components: [genreRow, levelRow1, levelRow2]
            });

            await interaction.editReply({ content: '✅ Message d\'auto-rôles créé avec succès !', ephemeral: true });
        } catch (error) {
            console.error('Erreur lors de la création du message d\'auto-rôles:', error);
            await interaction.reply({ content: '❌ Une erreur est survenue lors de la création du message.', ephemeral: true });
        }
    }
};
