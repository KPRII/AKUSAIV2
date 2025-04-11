const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        try {
            if (!fs.existsSync('./config.json')) {
                return await interaction.reply({
                    content: '❌ Le système de vérification n\'est pas configuré.',
                    ephemeral: true
                });
            }

            const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
            
            if (!config.roles || !config.roles.tempRoleId || !config.roles.memberRoleId) {
                return await interaction.reply({
                    content: '❌ La configuration du système est incomplète.',
                    ephemeral: true
                });
            }

            const { tempRoleId, memberRoleId } = config.roles;

            if (interaction.customId === 'verify-accept') {
                try {
                    // Récupérer les rôles
                    const tempRole = await interaction.guild.roles.fetch(tempRoleId);
                    const memberRole = await interaction.guild.roles.fetch(memberRoleId);

                    // Vérifier si l'utilisateur a déjà le rôle membre
                    if (memberRole && interaction.member.roles.cache.has(memberRole.id)) {
                        await interaction.reply({
                            content: '❌ Vous avez déjà validé le règlement.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Vérifier si l'utilisateur a déjà le rôle temporaire
                    if (tempRole && interaction.member.roles.cache.has(tempRole.id)) {
                        await interaction.reply({
                            content: '❌ Vous avez déjà accepté le règlement.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Ajouter le rôle temporaire
                    if (tempRole) {
                        await interaction.member.roles.add(tempRole);
                        
                        const embed = new EmbedBuilder()
                            .setColor('#2ecc71')
                            .setTitle('✅ Règlement Accepté')
                            .setDescription('Vous avez accepté le règlement. Vous pouvez maintenant choisir vos rôles.')
                            .setFooter({ text: 'Accédez au salon des rôles pour continuer' });

                        await interaction.reply({
                            embeds: [embed],
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'acceptation du règlement:', error);
                    await interaction.reply({
                        content: '❌ Une erreur est survenue. Contactez un administrateur.',
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Erreur dans le gestionnaire de boutons:', error);
            await interaction.reply({
                content: '❌ Une erreur système est survenue. Contactez un administrateur.',
                ephemeral: true
            });
        }
    }
};