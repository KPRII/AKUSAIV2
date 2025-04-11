const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Verrouiller un salon pour empêcher les messages.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addChannelOption(option => option.setName('channel').setDescription('Le salon à verrouiller').setRequired(false)),

    async execute(interaction, client) {
        try {
            const channel = interaction.options.getChannel('channel') || interaction.channel;

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return await interaction.reply({ content: 'Vous n\'avez pas la permission de verrouiller ce salon.', ephemeral: true });
            }

            if (channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {
                await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                    SendMessages: false,
                });

                const embed = new EmbedBuilder()
                    .setColor('#000000')
                    .setTitle('Salon Verrouillé')
                    .setDescription(`Le salon **${channel.name}** a été verrouillé. Personne ne peut plus envoyer de messages.`)
                    .setTimestamp()
                    .setFooter({ text: 'Action effectuée', iconURL: interaction.guild.iconURL() });

                await interaction.reply({ embeds: [embed] });
            } else {
                await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                    SendMessages: true,
                });

                const embed = new EmbedBuilder()
                    .setColor('#000000')
                    .setTitle('Salon Déverrouillé')
                    .setDescription(`Le salon **${channel.name}** a été déverrouillé. Tout le monde peut à nouveau envoyer des messages.`)
                    .setTimestamp()
                    .setFooter({ text: 'Action effectuée', iconURL: interaction.guild.iconURL() });

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    }
};
