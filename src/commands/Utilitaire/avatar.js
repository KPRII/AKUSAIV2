const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Affiche la photo de profil d\'un utilisateur en grand')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir la photo de profil')
                .setRequired(false)),

    async execute(interaction) {
        // Obtenir l'utilisateur ciblé ou l'auteur de la commande
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        
        // Créer l'embed avec l'avatar
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle(`Avatar de ${user.tag}`)
            .setImage(user.displayAvatarURL({ size: 4096, dynamic: true }))
            .setFooter({ 
                text: `Demandé par ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        // Ajouter des liens directs vers différents formats
        const formats = [];
        if (user.avatar) {
            formats.push(`[PNG](${user.displayAvatarURL({ size: 4096, format: 'png' })})`);
            formats.push(`[JPG](${user.displayAvatarURL({ size: 4096, format: 'jpg' })})`);
            formats.push(`[WEBP](${user.displayAvatarURL({ size: 4096, format: 'webp' })})`);
            
            if (user.avatar.startsWith('a_')) {
                formats.push(`[GIF](${user.displayAvatarURL({ size: 4096, format: 'gif' })})`);
            }
        }

        if (formats.length > 0) {
            embed.addFields({ 
                name: 'Liens directs', 
                value: formats.join(' • '), 
                inline: true 
            });
        }

        // Envoyer l'embed
        await interaction.reply({ embeds: [embed] });
    }
};
