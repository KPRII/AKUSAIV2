const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Retirer un rôle à un utilisateur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur auquel vous voulez retirer le rôle')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle que vous voulez retirer')
                .setRequired(true)),
    async execute(interaction) {
        const utilisateur = interaction.options.getUser('utilisateur');
        const role = interaction.options.getRole('role');
        const membre = interaction.guild.members.cache.get(utilisateur.id);
        const botMember = interaction.guild.members.me;

        if (!membre) {
            return interaction.reply({
                content: '❌ **Utilisateur introuvable ou non présent dans ce serveur.**',
                ephemeral: true
            });
        }

        // Vérifier que le bot a la permission de gérer les rôles
        if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: '❌ **Je n\'ai pas la permission de gérer les rôles dans ce serveur.**',
                ephemeral: true
            });
        }

        // Vérifier si l'utilisateur a le rôle
        if (!membre.roles.cache.has(role.id)) {
            return interaction.reply({
                content: `🔒 **${utilisateur} n'a pas le rôle ${role}.**`,
                ephemeral: true
            });
        }

        // Vérifier si le rôle à retirer est supérieur au rôle du bot
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({
                content: '⚠️ **Je ne peux pas retirer un rôle supérieur ou égal à mon propre rôle.**',
                ephemeral: true
            });
        }

        // Retirer le rôle de l'utilisateur
        try {
            await membre.roles.remove(role);
            interaction.reply({
                content: `✅ **Le rôle ${role} a été retiré de ${utilisateur} avec succès.**`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ **Une erreur s\'est produite lors du retrait du rôle.**',
                ephemeral: true
            });
        }
    },
};
