const { PermissionsBitField, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Débannir un utilisateur.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addStringOption(option => 
            option.setName('user')
                .setDescription('ID de l\'utilisateur à débannir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison du débannissement')
                .setRequired(false)),

    async execute(interaction) {
        const userId = interaction.options.getString('user');
        let reason = interaction.options.getString('reason');
        if (!reason) reason = 'Aucune raison fournie.';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({ content: 'Vous n\'avez pas la permission de débannir cet utilisateur.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Débannissement Réussi')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/190/190411.png')
            .addFields(
                { name: 'Utilisateur ID', value: `**${userId}**`, inline: true },
                { name: 'Raison', value: `**${reason}**`, inline: true },
            )
            .setFooter({ text: 'Action de débannissement', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        try {
            const bans = await interaction.guild.bans.fetch();

            if (bans.size === 0) {
                return await interaction.reply({ content: 'Aucun utilisateur banni sur ce serveur.', ephemeral: true });
            }

            const bannedUser = bans.get(userId);
            if (!bannedUser) {
                return await interaction.reply({ content: 'Cet utilisateur n\'est pas banni sur ce serveur.', ephemeral: true });
            }

            await interaction.guild.bans.remove(userId, reason);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors du débannissement.', ephemeral: true });
        }
    }
};
