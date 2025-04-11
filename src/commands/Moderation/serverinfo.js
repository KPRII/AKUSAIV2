const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Affiche des informations détaillées et stylées sur le serveur.'),

    async execute(interaction, client) {
        try {
            // Récupérer les informations du serveur
            const guild = interaction.guild;
            const owner = await guild.fetchOwner();
            const totalMembers = guild.memberCount;
            const onlineMembers = guild.members.cache.filter(member => member.presence && member.presence.status !== 'offline').size;
            const creationDate = guild.createdAt.toLocaleDateString();
            const region = guild.preferredLocale;
            const boostCount = guild.premiumSubscriptionCount;
            const emojiCount = guild.emojis.cache.size;
            const iconURL = guild.iconURL({ dynamic: true, size: 512 });

            // Créer un embed avec un design élégant
            const embed = new EmbedBuilder()
                .setColor('#000000')  // Couleur vibrante (tomato)
                .setTitle(`Informations sur **${guild.name}**`)
                .setDescription(`Voici les détails complets de ce serveur.`)
                .setThumbnail(iconURL)
                .addFields(
                    { name: '🌐 Nom du serveur', value: `${guild.name}`, inline: true },
                    { name: '👑 Propriétaire', value: `${owner.user.tag}`, inline: true },
                    { name: '🆔 ID du serveur', value: `${guild.id}`, inline: true },
                    { name: '👥 Membres totaux', value: `${totalMembers}`, inline: true },
                    { name: '🟢 Membres en ligne', value: `${onlineMembers}`, inline: true },
                    { name: '🌍 Région', value: `${region}`, inline: true },
                    { name: '🚀 Date de création', value: `${creationDate}`, inline: true },
                    { name: '💎 Boosts', value: `${boostCount} Boost(s)`, inline: true },
                    { name: '😎 Emojis disponibles', value: `${emojiCount}`, inline: true },
                    { name: '💬 Canaux', value: `${guild.channels.cache.size}`, inline: true },
                    { name: '🎮 Rôles', value: `${guild.roles.cache.size}`, inline: true }
                )
                .setFooter({ text: `Demandé par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp()
            
            // Répondre avec l'embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    }
};


