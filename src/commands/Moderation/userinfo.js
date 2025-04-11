const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Affiche les informations d\'un utilisateur.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option => option.setName('user').setDescription('L\'utilisateur à afficher').setRequired(false)),

    async execute(interaction, client) {
        try {
            // Récupération de l'utilisateur, ou de l'utilisateur qui a exécuté la commande
            const user = interaction.options.getUser('user') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id);

            // Créer un embed avec les informations de l'utilisateur
            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle(`Informations sur ${user.tag}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: 'Nom d\'utilisateur', value: `${user.username}`, inline: true },
                    { name: 'Tag', value: `#${user.discriminator}`, inline: true },
                    { name: 'ID', value: `${user.id}`, inline: true },
                    { name: 'Rôle principal', value: `${member.roles.highest.name}`, inline: true },
                    { name: 'Date d\'arrivée', value: `${member.joinedAt.toLocaleDateString()}`, inline: true },
                    { name: 'Date de création du compte', value: `${user.createdAt.toLocaleDateString()}`, inline: true },
                    { name: 'Status', value: `${user.presence ? user.presence.status : 'Hors ligne'}`, inline: true }
                )
                .setFooter({ text: 'Informations récupérées', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            // Répondre avec l'embed
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }
    }
};
