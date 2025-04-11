const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Retirer un utilisateur du mode timeout.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option => option.setName('user').setDescription('L\'utilisateur à retirer du timeout').setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: 'Vous n\'avez pas la permission de retirer le timeout des membres.', ephemeral: true });
        }

        if (!member) {
            return await interaction.reply({ content: 'Utilisateur non trouvé.', ephemeral: true });
        }

        try {
            await member.timeout(null, 'Timeout retiré par un modérateur.');

            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Timeout retiré')
                .setDescription(`${user.tag} a été retiré du mode timeout.`)
                .setTimestamp()
                .setFooter({ text: 'Action effectuée', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
};
