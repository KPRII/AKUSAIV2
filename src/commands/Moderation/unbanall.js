const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unbanall')
        .setDescription('Débannir tous les utilisateurs bannis du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Limite l'accès aux administrateurs

    async execute(interaction) {
        const botMember = interaction.guild.members.me;

        if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({
                content: '❌ **Je n\'ai pas la permission de gérer les bannissements dans ce serveur.**',
                ephemeral: true
            });
        }

        const bannedUsers = await interaction.guild.bans.fetch();

        if (bannedUsers.size === 0) {
            return interaction.reply({
                content: '🔒 **Aucun utilisateur n\'est banni dans ce serveur.**',
                ephemeral: true
            });
        }

        try {
            await Promise.all(bannedUsers.map(ban => interaction.guild.bans.remove(ban.user.id)));
            interaction.reply({
                content: `✅ **Tous les utilisateurs bannis ont été débannis avec succès.**`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ **Une erreur s\'est produite lors du débannissement des utilisateurs.**',
                ephemeral: true
            });
        }
    },
};
