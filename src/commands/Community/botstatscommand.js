const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botstats')
        .setDescription('Affiche les statistiques du bot'),
    async execute(interaction) {
        const botUser = interaction.client.user;

        // Obtenir des informations sur le bot
        const uptime = process.uptime();
        const totalSeconds = Math.floor(uptime);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Statistiques du Bot')
            .setAuthor({ name: botUser.username, iconURL: botUser.displayAvatarURL() })
            .addFields(
                { name: 'Uptime', value: `${days}j ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: 'Serveurs', value: `${interaction.client.guilds.cache.size}`, inline: true },
                { name: 'Utilisateurs', value: `${interaction.client.users.cache.size}`, inline: true },
                { name: 'Canaux', value: `${interaction.client.channels.cache.size}`, inline: true },
                { name: 'Version Node', value: `${process.version}`, inline: true },
                { name: 'Système d\'exploitation', value: `${os.type()} ${os.release()}`, inline: true }
            )
            .setFooter({ text: 'Bot Statistics', iconURL: botUser.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
