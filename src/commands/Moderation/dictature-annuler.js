const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dictature-annuler')
        .setDescription('🔓 Annuler la dictature et rétablir les permissions')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        
        // Créer un embed pour le message de déverrouillage
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ SALON DÉVERROUILLÉ')
            .setDescription('Ce salon a été déverrouillé par un administrateur.')
            .setTimestamp()
            .setFooter({
                text: `Déverrouillé par ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

        // Répondre d'abord pour éviter le timeout
        await interaction.reply({
            content: '🔓 Déverrouillage des salons en cours...',
            ephemeral: true
        });

        let unlockedCount = 0;
        let errorCount = 0;

        // Déverrouiller tous les salons textuels
        const channels = guild.channels.cache.filter(channel => 
            channel.type === 0 || // GUILD_TEXT
            channel.type === 2 || // GUILD_VOICE
            channel.type === 13 || // GUILD_STAGE_VOICE
            channel.type === 5 // GUILD_ANNOUNCEMENT
        );

        for (const [_, channel] of channels) {
            try {
                // Rétablir les permissions par défaut pour @everyone
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: null, // null supprime la permission spécifique
                    AddReactions: null,
                    CreatePublicThreads: null,
                    CreatePrivateThreads: null,
                    SendMessagesInThreads: null,
                    Connect: null,
                    Speak: null
                });

                // Envoyer le message de déverrouillage si c'est un salon textuel
                if (channel.type === 0 || channel.type === 5) {
                    await channel.send({ embeds: [embed] });
                }

                unlockedCount++;
            } catch (error) {
                console.error(`Erreur lors du déverrouillage du salon ${channel.name}:`, error);
                errorCount++;
            }
        }

        // Mettre à jour le message de réponse
        await interaction.editReply({
            content: `🔓 Déverrouillage terminé !\n✅ ${unlockedCount} salons déverrouillés\n${errorCount > 0 ? `❌ ${errorCount} erreurs` : ''}`,
            ephemeral: true
        });
    }
};
