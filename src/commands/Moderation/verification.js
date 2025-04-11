const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification')
        .setDescription('Configure le système de vérification')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le salon de vérification')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle à donner après vérification')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');

        // Sauvegarder les IDs dans un fichier de configuration
        const fs = require('fs');
        const config = {
            verification: {
                channelId: channel.id,
                roleId: role.id
            }
        };

        fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));

        // Créer l'embed
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
            .setFooter({ text: 'Cliquez sur le bouton ci-dessous pour accéder au serveur' });

        // Créer le bouton
        const button = new ButtonBuilder()
            .setCustomId('accept-rules')
            .setLabel('J\'accepte le règlement')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder()
            .addComponents(button);

        // Envoyer le message
        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.reply({ 
            content: '✅ Le système de vérification a été configuré avec succès !', 
            ephemeral: true 
        });
    }
};
