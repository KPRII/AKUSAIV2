const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Ajouter un rôle à un utilisateur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur auquel vous voulez ajouter le rôle')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle que vous voulez ajouter')
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

        // Vérifier si l'utilisateur a déjà le rôle
        if (membre.roles.cache.has(role.id)) {
            return interaction.reply({
                content: `🔒 **${utilisateur} a déjà le rôle ${role}.**`,
                ephemeral: true
            });
        }

        // Vérifier si le rôle à ajouter est supérieur au rôle du bot
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({
                content: '⚠️ **Je ne peux pas ajouter un rôle supérieur à mon propre rôle.**',
                ephemeral: true
            });
        }

        // Ajouter le rôle à l'utilisateur
        try {
            await membre.roles.add(role);
            interaction.reply({
                content: `✅ **Le rôle ${role} a été ajouté à ${utilisateur} avec succès.**`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ **Une erreur s\'est produite lors de l\'ajout du rôle.**',
                ephemeral: true
            });
        }
    },
};
