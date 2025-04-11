module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const { customId, member, guild } = interaction;

        switch (customId) {
            case 'accept-rules': {
                try {
                    // Récupérer le rôle initial depuis la configuration
                    const config = require('../../config.json');
                    const initialRole = await guild.roles.fetch(config.verification.initialRoleId);

                    if (!initialRole) {
                        await interaction.reply({
                            content: '❌ Erreur: Le rôle initial n\'a pas été trouvé.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Ajouter le rôle initial
                    await member.roles.add(initialRole);

                    await interaction.reply({
                        content: '✅ Vous avez accepté le règlement ! Rendez-vous dans le salon des rôles pour terminer votre vérification.',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Erreur lors de l\'acceptation du règlement:', error);
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors de la validation du règlement.',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'complete-verification': {
                try {
                    // Récupérer le rôle final depuis la configuration
                    const config = require('../../config.json');
                    const finalRole = await guild.roles.fetch(config.verification.finalRoleId);
                    const initialRole = await guild.roles.fetch(config.verification.initialRoleId);

                    if (!finalRole || !initialRole) {
                        await interaction.reply({
                            content: '❌ Erreur: Les rôles n\'ont pas été trouvés.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Vérifier si le membre a le rôle initial
                    if (!member.roles.cache.has(initialRole.id)) {
                        await interaction.reply({
                            content: '❌ Vous devez d\'abord accepter le règlement !',
                            ephemeral: true
                        });
                        return;
                    }

                    // Retirer le rôle initial et ajouter le rôle final
                    await member.roles.remove(initialRole);
                    await member.roles.add(finalRole);

                    await interaction.reply({
                        content: '🎉 Félicitations ! Vous avez maintenant accès à l\'intégralité du serveur !',
                        ephemeral: true
                    });
                } catch (error) {
                    console.error('Erreur lors de la complétion de la vérification:', error);
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors de la validation finale.',
                        ephemeral: true
                    });
                }
                break;
            }
        }
    }
};
