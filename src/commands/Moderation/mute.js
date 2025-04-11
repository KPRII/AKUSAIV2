const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Exclut temporairement un utilisateur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utilisateur à exclure')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Durée de l\'exclusion (1m, 5m, 10m, 1h, 1j, 7j)')
                .setRequired(true)
                .addChoices(
                    { name: '1 minute', value: '1m' },
                    { name: '5 minutes', value: '5m' },
                    { name: '10 minutes', value: '10m' },
                    { name: '1 heure', value: '1h' },
                    { name: '1 jour', value: '1j' },
                    { name: '7 jours', value: '7j' },
                ))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison de l\'exclusion')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // Vérifier les permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❔ Vous n\'avez pas la permission d\'utiliser cette commande!', ephemeral: true });
            }

            const targetUser = interaction.options.getUser('user');
            const duration = interaction.options.getString('duration');
            const reason = interaction.options.getString('reason') || 'Aucune raison fournie.';
            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // Vérifier si on peut modérer l'utilisateur
            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return await interaction.reply({ content: '❔ Je ne peux pas modérer cet utilisateur car son rôle est plus haut que le mien.', ephemeral: true });
            }

            // Convertir la durée en millisecondes
            let timeoutDuration;
            switch (duration) {
                case '1m':
                    timeoutDuration = 60 * 1000;
                    break;
                case '5m':
                    timeoutDuration = 5 * 60 * 1000;
                    break;
                case '10m':
                    timeoutDuration = 10 * 60 * 1000;
                    break;
                case '1h':
                    timeoutDuration = 60 * 60 * 1000;
                    break;
                case '1j':
                    timeoutDuration = 24 * 60 * 60 * 1000;
                    break;
                case '7j':
                    timeoutDuration = 7 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    timeoutDuration = 60 * 1000; // 1 minute par défaut
            }

            // Appliquer l'exclusion temporaire
            try {
                await targetMember.timeout(timeoutDuration, reason);
            } catch (error) {
                console.error('Erreur lors de l\'exclusion temporaire:', error);
                return await interaction.reply({ content: '❌ Impossible d\'exclure temporairement l\'utilisateur.', ephemeral: true });
            }

            // Répondre à la commande
            await interaction.reply(
                `✅ ${targetUser.tag} a été exclu pour ${duration}.\n` +
                `Raison: ${reason}`
            );

            // Envoyer un DM à l'utilisateur
            try {
                await targetUser.send(
                    `Vous avez été exclu du serveur ${interaction.guild.name} pour ${duration}.\n` +
                    `Raison: ${reason}`
                );
            } catch (err) {
                console.log('Impossible d\'envoyer un DM à l\'utilisateur');
            }

        } catch (error) {
            console.error('Erreur dans la commande mute:', error);
            await interaction.reply({ content: '❔ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    }
};
