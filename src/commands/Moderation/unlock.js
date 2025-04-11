const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Déverrouiller un salon pour permettre l\'envoi de messages.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addChannelOption(option => option.setName('channel').setDescription('Le salon à déverrouiller').setRequired(false)),

    async execute(interaction, client) {
        try {
            const channel = interaction.options.getChannel('channel') || interaction.channel;

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return await interaction.reply({ content: 'Vous n\'avez pas la permission de déverrouiller ce salon.', ephemeral: true });
            }

            if (!channel.permissionsFor(channel.guild.roles.everyone).has(PermissionsBitField.Flags.SendMessages)) {
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
            } else {
                return await interaction.reply({ content: 'Ce salon est déjà déverrouillé.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    }
};
