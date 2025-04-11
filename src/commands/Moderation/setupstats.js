const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupstats')
        .setDescription('Configure les salons de statistiques')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Déférer la réponse pour avoir plus de temps
            await interaction.deferReply({ ephemeral: true });

            // Charger les fonctions
            const statsModule = require('../../events/updateStats.js');
            
            // Créer les canaux
            await statsModule.createStatsChannels(interaction.guild);
            
            // Mettre à jour les statistiques
            await statsModule.updateStats(interaction.guild);

            // Répondre une fois que tout est terminé
            await interaction.editReply({ content: '✅ Les salons de statistiques ont été configurés avec succès !' });
        } catch (error) {
            console.error('Erreur lors de la configuration des stats:', error);
            const errorMessage = error.message || '❌ Une erreur est survenue lors de la configuration des statistiques.';
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};
