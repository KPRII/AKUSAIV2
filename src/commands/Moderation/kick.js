const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulser un utilisateur du serveur.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utilisateur à expulser')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison de l\'expulsion.')),

    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: false });

            const userKick = interaction.options.getUser('user');
            const memberKick = await interaction.guild.members.fetch(userKick.id);

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return await interaction.editReply({ 
                    content: "Vous n'avez pas la permission d'expulser cet utilisateur." 
                });
            }

            if (!memberKick) {
                return await interaction.editReply({ 
                    content: "L'utilisateur que vous souhaitez expulser n'est pas sur le serveur." 
                });
            }

            if (!memberKick.kickable) {
                return await interaction.editReply({ 
                    content: "Je ne peux pas expulser cet utilisateur." 
                });
            }

            const reason = interaction.options.getString('reason') || "Aucune raison fournie.";

            const embedDM = new EmbedBuilder()
                .setColor("#000000")
                .setTitle('🚫 Notification d\'Expulsion 🚫')
                .setDescription(`Tu as été expulsé du serveur **${interaction.guild.name}**.`)
                .addFields({ name: '🔴 Raison :', value: `**${reason}**` })
                .setFooter({ text: 'Expulsion effectuée', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle('✅ Expulsion Réussie ✅')
                .addFields(
                    { name: '👤 Utilisateur', value: `**${userKick.tag}**`, inline: true },
                    { name: '🔴 Raison :', value: `**${reason}**`, inline: true }
                )
                .setFooter({ text: 'Action d\'expulsion', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            try {
                await userKick.send({ embeds: [embedDM] });
            } catch (error) {
                console.error("Impossible d'envoyer un message à l'utilisateur expulsé.", error);
            }

            await memberKick.kick(reason);
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: "Une erreur est survenue lors de l'exécution de cette commande." 
            });
        }
    }
};
