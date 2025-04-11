const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearlink')
        .setDescription('Supprimer les messages contenant des liens dans le salon.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addIntegerOption(option => option.setName('amount').setDescription('Le nombre de messages à vérifier et supprimer').setRequired(true)),

    async execute(interaction, client) {
        try {
            const amount = interaction.options.getInteger('amount');

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return await interaction.reply({ content: 'Vous n\'avez pas la permission de supprimer des messages.', ephemeral: true });
            }

            if (amount < 1 || amount > 100) {
                return await interaction.reply({ content: 'Vous devez spécifier un nombre entre 1 et 100.', ephemeral: true });
            }

            const messages = await interaction.channel.messages.fetch({ limit: amount });

            const messagesWithLinks = messages.filter(msg => msg.content.includes('http://') || msg.content.includes('https://'));

            if (messagesWithLinks.size === 0) {
                return await interaction.reply({ content: 'Aucun message contenant des liens n\'a été trouvé.', ephemeral: true });
            }

            await interaction.channel.bulkDelete(messagesWithLinks, true).catch(err => {
                console.error(err);
                return interaction.reply({ content: 'Erreur lors de la suppression des messages.', ephemeral: true });
            });

            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Suppression de messages contenant des liens')
                .setDescription(`**${messagesWithLinks.size}** message(s) contenant des liens ont été supprimé(s) dans ce salon.`)
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
