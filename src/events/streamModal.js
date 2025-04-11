const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'stream_modal') return;

        try {
            // Récupérer les données du stream
            const userData = interaction.client.streamData.get(interaction.user.id);
            if (!userData) {
                return await interaction.reply({
                    content: 'Une erreur est survenue. Veuillez réessayer la commande /live.',
                    ephemeral: true
                });
            }

            const { lien, jeu } = userData;
            const title = interaction.fields.getTextInputValue('title');
            const description = interaction.fields.getTextInputValue('description');

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor('#6441a5')
                .setTitle(title)
                .setDescription(description)
                .addFields(
                    { name: '🎮 Jeu', value: jeu, inline: true },
                    { name: '🔴 Lien', value: `[Regarder le stream](${lien})`, inline: true }
                )
                .setTimestamp()
                .setFooter({ 
                    text: `Stream de ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                });

            // Envoyer l'annonce
            const announceChannel = interaction.guild.channels.cache.find(c => c.name === 'annonce-stream');
            if (!announceChannel) {
                return await interaction.reply({
                    content: 'Le salon #annonce-stream n\'existe pas. Contactez un administrateur.',
                    ephemeral: true
                });
            }

            // Ping @everyone et envoyer l'embed
            await announceChannel.send({
                content: '@everyone Un nouveau stream commence !',
                embeds: [embed]
            });

            // Confirmer à l'utilisateur
            await interaction.reply({
                content: 'Ton stream a été annoncé avec succès !',
                ephemeral: true
            });

            // Nettoyer les données
            interaction.client.streamData.delete(interaction.user.id);

        } catch (error) {
            console.error('Erreur lors de l\'annonce du stream:', error);
            await interaction.reply({
                content: 'Une erreur est survenue lors de l\'annonce du stream.',
                ephemeral: true
            });
        }
    }
};
