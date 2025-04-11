const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reglement')
        .setDescription('Crée un message de règlement avec un bouton de validation')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à donner après validation du règlement')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('verification_channel')
                .setDescription('Le salon de vérification à cacher après validation')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const verificationChannel = interaction.options.getChannel('verification_channel');

        // Configuration initiale du salon de vérification
        await verificationChannel.permissionOverwrites.set([
            {
                id: interaction.guild.roles.everyone.id,
                allow: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: role.id,
                deny: [PermissionFlagsBits.ViewChannel],
            }
        ]);

        const embed = new EmbedBuilder()
            .setTitle('📜 Règlement du Serveur')
            .setColor('#2f3136')
            .setDescription(`
**1. Respect Mutuel**
• Soyez respectueux envers tous les membres
• Pas d'insultes, de harcèlement ou de discrimination
• Évitez les débats houleux et les provocations

**2. Contenu Approprié**
• Pas de contenu NSFW ou inapproprié
• Pas de spam ou de publicité non autorisée
• Évitez le flood et les messages répétitifs

**3. Utilisation des Salons**
• Respectez le thème de chaque salon
• Utilisez les commandes dans les salons appropriés
• Suivez les instructions des modérateurs

**4. Sécurité**
• Ne partagez pas d'informations personnelles
• Signalez tout comportement suspect aux modérateurs
• Protégez votre compte et vos informations

**5. Sanctions**
• Les infractions seront sanctionnées selon leur gravité
• Les modérateurs se réservent le droit d'appliquer des sanctions
• Les décisions de la modération sont finales

En cliquant sur le bouton ci-dessous, vous acceptez de suivre ces règles.`)
            .setFooter({ text: 'Merci de votre compréhension et de votre collaboration' });

        const button = new ButtonBuilder()
            .setCustomId('accept-rules')
            .setLabel('J\'accepte le règlement')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(button);

        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            filter: i => i.customId === 'accept-rules'
        });

        collector.on('collect', async (i) => {
            const member = i.member;
            
            try {
                // Ajouter le rôle
                await member.roles.add(role);

                await i.reply({
                    content: '✅ Merci d\'avoir accepté le règlement ! Vous avez maintenant accès au serveur.',
                    ephemeral: true
                });

                // Attendre un peu pour s'assurer que le rôle est bien ajouté
                setTimeout(async () => {
                    try {
                        // Rafraîchir le membre pour s'assurer d'avoir les données à jour
                        const updatedMember = await i.guild.members.fetch(member.id);
                        if (updatedMember.roles.cache.has(role.id)) {
                            console.log('Le rôle a bien été ajouté, le salon va être caché');
                        } else {
                            console.log('Le rôle n\'a pas encore été ajouté, on attend');
                        }
                    } catch (error) {
                        console.error('Erreur lors de la vérification du rôle:', error);
                    }
                }, 1000);

            } catch (error) {
                console.error('Erreur lors de la validation:', error);
                await i.reply({
                    content: '❌ Une erreur est survenue lors de la validation du règlement.',
                    ephemeral: true
                });
            }
        });

        await interaction.followUp({
            content: '✅ Le système de règlement a été configuré avec succès ! Le salon sera automatiquement caché pour les membres ayant le rôle.',
            ephemeral: true
        });
    }
};
