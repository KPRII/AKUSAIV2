const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Mettre un utilisateur en mode timeout (temps mort).')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option => option.setName('user').setDescription('L\'utilisateur à mettre en timeout').setRequired(true))
        .addIntegerOption(option => option.setName('duration').setDescription('La durée du timeout en secondes').setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const member = interaction.guild.members.cache.get(user.id);

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return await interaction.reply({ content: 'Vous n\'avez pas la permission de mettre en timeout des membres.', ephemeral: true });
        }

        if (!member) {
            return await interaction.reply({ content: 'Utilisateur non trouvé.', ephemeral: true });
        }

        try {
            await member.timeout(duration * 1000, 'Timeout appliqué par un modérateur.');

            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Timeout appliqué')
                .setDescription(`${user.tag} a été mis en timeout pour ${duration} secondes.`)
                .setTimestamp()
                .setFooter({ text: 'Action effectuée', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
        }
    }
};
