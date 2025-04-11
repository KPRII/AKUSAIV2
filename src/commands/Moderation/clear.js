const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprimer un nombre de messages dans le salon.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addIntegerOption(option => option.setName('amount').setDescription('Le nombre de messages à supprimer').setRequired(true)),

    async execute(interaction, client) {
        try {
            const amount = interaction.options.getInteger('amount');

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return await interaction.reply({ content: 'Vous n\'avez pas la permission de supprimer des messages.', ephemeral: true });
            }

            if (amount < 1 || amount > 100) {
                return await interaction.reply({ content: 'Vous devez spécifier un nombre entre 1 et 100.', ephemeral: true });
            }

            await interaction.channel.bulkDelete(amount, true).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'Erreur lors de la suppression des messages.', ephemeral: true });
            });

            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Suppression de messages')
                .setDescription(`**${amount}** message(s) ont été supprimé(s) dans ce salon.`)
                .setTimestamp()
                .setFooter({ text: 'Action effectuée', iconURL: interaction.guild.iconURL() });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    }
};
