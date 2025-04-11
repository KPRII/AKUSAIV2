const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Active le mode lent sur un canal.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addIntegerOption(option =>
            option.setName('temps')
                .setDescription('Durée en secondes entre chaque message (0 pour désactiver)')
                .setRequired(true)
                .setMinValue(0)
        ),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return await interaction.reply({
                    content: 'Vous n\'avez pas la permission de gérer les canaux.',
                    ephemeral: true
                });
            }

            const slowmodeTime = interaction.options.getInteger('temps');

            await interaction.channel.setRateLimitPerUser(slowmodeTime);

            const slowmodeMessage = slowmodeTime > 0
                ? `Le mode lent a été activé avec un délai de ${slowmodeTime} seconde(s) entre chaque message.`
                : 'Le mode lent a été désactivé.';

            await interaction.reply({ content: slowmodeMessage, ephemeral: true });

            await interaction.user.send({
                content: slowmodeTime > 0
                    ? `Le mode lent a été activé sur le canal ${interaction.channel.name} avec un délai de ${slowmodeTime} seconde(s) entre chaque message.`
                    : `Le mode lent a été désactivé sur le canal ${interaction.channel.name}.`
            });

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'activation du slowmode.', ephemeral: true });
            }
        }
    },
};
