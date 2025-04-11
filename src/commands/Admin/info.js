const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Obtenir des informations sur le serveur, les rôles, les emojis, etc.')
        .addSubcommandGroup(group =>
            group
                .setName('serveur')
                .setDescription('Informations sur le serveur')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('stats')
                        .setDescription('Voir les statistiques du serveur'))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('salon')
                        .setDescription('Voir les informations d\'un salon')
                        .addChannelOption(option =>
                            option.setName('salon')
                                .setDescription('Le salon à inspecter')
                                .setRequired(true))))
        .addSubcommandGroup(group =>
            group
                .setName('membre')
                .setDescription('Informations sur les membres')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('role')
                        .setDescription('Voir les informations d\'un rôle')
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Le rôle à inspecter')
                                .setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('emoji')
                        .setDescription('Voir les informations d\'un emoji')
                        .addStringOption(option =>
                            option.setName('emoji')
                                .setDescription('L\'emoji à inspecter')
                                .setRequired(true))))
        .addSubcommandGroup(group =>
            group
                .setName('annonce')
                .setDescription('Gérer les annonces du serveur')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('ajouter')
                        .setDescription('Ajouter une nouvelle annonce')
                        .addStringOption(option =>
                            option.setName('titre')
                                .setDescription('Le titre de l\'annonce')
                                .setRequired(true))
                        .addStringOption(option =>
                            option.setName('description')
                                .setDescription('Le contenu de l\'annonce')
                                .setRequired(true))
                        .addStringOption(option =>
                            option.setName('image')
                                .setDescription('URL de l\'image (optionnel)')
                                .setRequired(false)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('supprimer')
                        .setDescription('Supprimer la dernière annonce'))),

    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();

        if (group === 'serveur') {
            if (subcommand === 'stats') {
                const guild = interaction.guild;
                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle(`📊 Statistiques de ${guild.name}`)
                    .addFields(
                        { name: 'Membres', value: `👥 ${guild.memberCount}`, inline: true },
                        { name: 'Salons', value: `💬 ${guild.channels.cache.size}`, inline: true },
                        { name: 'Rôles', value: `🎭 ${guild.roles.cache.size}`, inline: true },
                        { name: 'Emojis', value: `😄 ${guild.emojis.cache.size}`, inline: true },
                        { name: 'Boost niveau', value: `⭐ ${guild.premiumTier}`, inline: true },
                        { name: 'Nombre de boosts', value: `🚀 ${guild.premiumSubscriptionCount}`, inline: true }
                    )
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
            else if (subcommand === 'salon') {
                const channel = interaction.options.getChannel('salon');
                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle(`ℹ️ Information sur #${channel.name}`)
                    .addFields(
                        { name: 'ID', value: channel.id, inline: true },
                        { name: 'Type', value: channel.type, inline: true },
                        { name: 'Catégorie', value: channel.parent ? channel.parent.name : 'Aucune', inline: true },
                        { name: 'Créé le', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: true }
                    );

                await interaction.reply({ embeds: [embed] });
            }
        }
        else if (group === 'membre') {
            if (subcommand === 'role') {
                const role = interaction.options.getRole('role');
                const embed = new EmbedBuilder()
                    .setColor(role.color)
                    .setTitle(`ℹ️ Information sur @${role.name}`)
                    .addFields(
                        { name: 'ID', value: role.id, inline: true },
                        { name: 'Couleur', value: role.hexColor, inline: true },
                        { name: 'Position', value: `${role.position}`, inline: true },
                        { name: 'Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
                        { name: 'Membres', value: `${role.members.size}`, inline: true },
                        { name: 'Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true }
                    );

                await interaction.reply({ embeds: [embed] });
            }
            else if (subcommand === 'emoji') {
                const emojiInput = interaction.options.getString('emoji');
                const emojiId = emojiInput.match(/\d+/)?.[0];
                if (!emojiId) {
                    return await interaction.reply({
                        content: 'Veuillez fournir un emoji personnalisé valide.',
                        ephemeral: true
                    });
                }

                const emoji = interaction.guild.emojis.cache.get(emojiId);
                if (!emoji) {
                    return await interaction.reply({
                        content: 'Emoji non trouvé sur ce serveur.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle(`ℹ️ Information sur l'emoji ${emoji.name}`)
                    .setThumbnail(emoji.url)
                    .addFields(
                        { name: 'ID', value: emoji.id, inline: true },
                        { name: 'Nom', value: emoji.name, inline: true },
                        { name: 'Animé', value: emoji.animated ? 'Oui' : 'Non', inline: true },
                        { name: 'Créé le', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>`, inline: true }
                    );

                await interaction.reply({ embeds: [embed] });
            }
        }
        else if (group === 'annonce') {
            // Vérifier les permissions pour les annonces
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({
                    content: 'Vous n\'avez pas la permission de gérer les annonces.',
                    ephemeral: true
                });
            }

            const infoChannel = interaction.guild.channels.cache.find(c => c.name === 'information');
            if (!infoChannel) {
                return await interaction.reply({
                    content: 'Le salon #information n\'existe pas.',
                    ephemeral: true
                });
            }

            if (subcommand === 'ajouter') {
                const titre = interaction.options.getString('titre');
                const description = interaction.options.getString('description');
                const imageUrl = interaction.options.getString('image');

                const embed = new EmbedBuilder()
                    .setColor('#2b2d31')
                    .setTitle(titre)
                    .setDescription(description)
                    .setTimestamp()
                    .setFooter({
                        text: `Annonce par ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    });

                if (imageUrl) {
                    embed.setImage(imageUrl);
                }

                try {
                    await infoChannel.send({ embeds: [embed] });
                    await interaction.reply({
                        content: 'Annonce ajoutée avec succès !',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de l\'annonce:', error);
                    await interaction.reply({
                        content: 'Une erreur est survenue lors de l\'ajout de l\'annonce.',
                        ephemeral: true
                    });
                }
            }
            else if (subcommand === 'supprimer') {
                try {
                    const messages = await infoChannel.messages.fetch({ limit: 1 });
                    const lastMessage = messages.first();
                    
                    if (!lastMessage) {
                        return await interaction.reply({
                            content: 'Aucun message à supprimer.',
                            ephemeral: true
                        });
                    }

                    if (lastMessage.author.id !== interaction.client.user.id) {
                        return await interaction.reply({
                            content: 'Le dernier message n\'a pas été envoyé par le bot.',
                            ephemeral: true
                        });
                    }

                    await lastMessage.delete();
                    await interaction.reply({
                        content: 'Dernière annonce supprimée avec succès !',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Erreur lors de la suppression de l\'annonce:', error);
                    await interaction.reply({
                        content: 'Une erreur est survenue lors de la suppression de l\'annonce.',
                        ephemeral: true
                    });
                }
            }
        }
    }
};
