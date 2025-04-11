const { PermissionsBitField, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannir un utilisateur du serveur.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utilisateur à bannir')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison du ban')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const userToBan = interaction.options.getUser('user');
            const memberToBan = interaction.guild.members.cache.get(userToBan.id);
            const reason = interaction.options.getString('reason') || 'Aucune raison fournie.';

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return await interaction.reply({ content: '❌ Vous n\'avez pas la permission de bannir des membres.', ephemeral: true });
            }

            if (interaction.user.id === userToBan.id) {
                return await interaction.reply({ content: '❌ Vous ne pouvez pas vous bannir vous-même.', ephemeral: true });
            }

            if (memberToBan && interaction.guild.members.me.roles.highest.position <= memberToBan.roles.highest.position) {
                return await interaction.reply({ content: '❌ Impossible de bannir cet utilisateur (rôle trop élevé).', ephemeral: true });
            }

            const embedDM = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Tu as été banni')
                .setDescription(`Tu as été banni du serveur **${interaction.guild.name}**.`)
                .addFields({ name: 'Raison', value: reason })
                .setTimestamp();

            const embedReply = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Bannissement effectué')
                .setThumbnail(interaction.guild.iconURL())
                .addFields(
                    { name: 'Utilisateur', value: `**${userToBan.tag}**\n\`${userToBan.id}\``, inline: true },
                    { name: 'Raison', value: `**${reason}**`, inline: true }
                )
                .setFooter({ text: `Ban exécuté par ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.deferReply();

            try {
                await userToBan.send({ embeds: [embedDM] });
            } catch {
                console.warn(`Impossible d’envoyer un DM à ${userToBan.tag}.`);
            }

            await interaction.guild.members.ban(userToBan.id, { reason });

            await interaction.editReply({ embeds: [embedReply] });

        } catch (error) {
            console.error('Erreur dans la commande ban :', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Une erreur est survenue lors de l’exécution de cette commande.', ephemeral: true });
            }
        }
    }
};
