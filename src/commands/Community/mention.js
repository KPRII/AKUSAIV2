const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mention')
        .setDescription('Répondre quand un utilisateur mentionne le bot'),
    async execute(interaction) {
        const user = interaction.user;
        const botUser = interaction.client.user;

        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Mentionné!')
            .setDescription(`Hey ${user.username}, tu m'as mentionné ! Pourquoi tu me mentionnes ? Besoin d'aide ? Utilise \`/help\` pour voir toutes mes commandes.`)
            .setThumbnail(user.displayAvatarURL())
            .setAuthor({ name: botUser.username, iconURL: botUser.displayAvatarURL() })
            .addFields(
                { name: 'Utilisateur', value: `${user.username}`, inline: true },
                { name: 'ID de l\'Utilisateur', value: `${user.id}`, inline: true }
            )
            .setFooter({ text: 'Mentions du bot', iconURL: botUser.displayAvatarURL() })
            .setImage('https://cdn.discordapp.com/attachments/1259964953331499069/1316497879442915358/04347e0a8dc2d0a6bcb55e0cc2f0c690.png?ex=675e8f71&is=675d3df1&hm=b41a484bc02ccd409977a6cd4805b3469c7d3d29cf5a629bedc0eccd122e1374&') // Ajoutez l'URL de votre image transparente ici comme bannière
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

