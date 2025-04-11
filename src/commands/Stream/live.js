const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('live')
        .setDescription('Annonce ton stream avec une belle présentation')
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Lien de ton stream (Twitch, YouTube, etc.)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('jeu')
                .setDescription('Le jeu que tu vas streamer')
                .setRequired(true)),

    async execute(interaction) {
        // Créer le modal
        const modal = new ModalBuilder()
            .setCustomId('stream_modal')
            .setTitle('Détails du stream');

        // Ajouter les champs
        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Titre du stream')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setPlaceholder('Ex: 🎮 Stream chill sur Minecraft !');

        const descriptionInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setPlaceholder('Décris ton stream en quelques mots...');

        // Ajouter les composants au modal
        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        // Stocker les options dans la session de l'utilisateur
        interaction.client.streamData = interaction.client.streamData || new Map();
        interaction.client.streamData.set(interaction.user.id, {
            lien: interaction.options.getString('lien'),
            jeu: interaction.options.getString('jeu')
        });

        // Afficher le modal
        await interaction.showModal(modal);
    }
};
