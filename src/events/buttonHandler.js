const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'accept-rules') {
            try {
                // Lire la configuration
                const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
                const roleId = config.verification.roleId;

                // Récupérer le rôle
                const role = await interaction.guild.roles.fetch(roleId);
                if (!role) {
                    await interaction.reply({
                        content: '❌ Erreur: Le rôle n\'a pas été trouvé. Contactez un administrateur.',
                        ephemeral: true
                    });
                    return;
                }

                // Ajouter le rôle
                await interaction.member.roles.add(role);

                // Envoyer la confirmation
                await interaction.reply({
                    content: '✅ Merci d\'avoir accepté le règlement ! Vous avez maintenant accès au serveur.',
                    ephemeral: true
                });

            } catch (error) {
                console.error('Erreur lors de la validation du règlement:', error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la validation du règlement. Contactez un administrateur.',
                    ephemeral: true
                });
            }
        }
    }
};
