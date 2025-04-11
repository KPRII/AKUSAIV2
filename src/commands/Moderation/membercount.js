const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Afficher le nombre actuel de membres sur le serveur.'),

    async execute(interaction, client) {
        try {
            // Récupérer les informations sur le serveur
            const guild = await client.guilds.fetch(interaction.guildId);
            const memberCount = guild.memberCount;

            // Créer un embed "waow" pour afficher le compteur de membres
            const embed = new EmbedBuilder()
                .setColor('#000000') // Or couleur dorée
                .setTitle('✨ Membres du Serveur ✨')
                .setDescription(`🎉 **Le serveur compte actuellement ${memberCount} membres !** 🎉`)
                .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: '📅 Date de création du serveur', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
                    { name: '🌐 Région', value: guild.preferredLocale || 'Non spécifiée', inline: true }
                )
                .setImage(guild.bannerURL({ dynamic: true, size: 1024 }) || client.user.displayAvatarURL({ dynamic: true, size: 1024 })) // Utiliser la bannière ou un fallback
                .setFooter({ text: `Dernière mise à jour : ${new Date().toLocaleString()}`, iconURL: client.user.displayAvatarURL() });

            // Répondre à l'interaction avec l'embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erreur lors de l'exécution de la commande membercount:", error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
};
