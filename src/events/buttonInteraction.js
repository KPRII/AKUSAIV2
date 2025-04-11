const { Events } = require('discord.js');

// Configuration des rôles
const roles = {
    'role-fille': { name: 'Fille', color: '#ff69b4', id: '1359967326988013619' },
    'role-garcon': { name: 'Garçon', color: '#4169e1', id: '1359967327931601068' },
    'role-nonbinaire': { name: '🚁 de combat', color: '#9b59b6' },
    'level-1-25': { name: 'Niveau 1-25', color: '#98ff98' },
    'level-26-50': { name: 'Niveau 26-50', color: '#32cd32' },
    'level-51-75': { name: 'Niveau 51-75', color: '#228b22' },
    'level-76-101': { name: 'Niveau 76-101', color: '#ff69b4' }
};

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        // Ne gérer que les interactions de boutons
        if (!interaction.isButton()) return;
        
        // Ne gérer que les boutons d'auto-rôles
        if (!Object.keys(roles).includes(interaction.customId)) return;

        try {
            console.log('Button interaction detected:', interaction.customId);

            // Vérifier si le serveur est disponible
            if (!interaction.guild) {
                console.error('Guild not available');
                return await interaction.reply({
                    content: '❌ Cette commande ne peut être utilisée que sur un serveur.',
                    ephemeral: true
                });
            }

            // Vérifier les permissions
            if (!interaction.guild.members.me.permissions.has('ManageRoles')) {
                return await interaction.reply({ 
                    content: '❌ Je n\'ai pas la permission de gérer les rôles.', 
                    ephemeral: true 
                });
            }

            // Récupérer la configuration du rôle
            const roleConfig = roles[interaction.customId];
            if (!roleConfig) {
                console.error('Configuration du rôle introuvable pour:', interaction.customId);
                return await interaction.editReply({
                    content: '❌ La configuration du système est incomplète.',
                    ephemeral: true
                }).catch(() => {});
            }

            // Rafraîchir le cache des rôles
            await interaction.guild.roles.fetch();
            console.log('Cache des rôles rafraîchi');
            
            // Chercher le rôle par ID si disponible, sinon par nom
            let targetRole;
            if (roleConfig.id) {
                targetRole = await interaction.guild.roles.fetch(roleConfig.id);
                console.log('Recherche du rôle par ID:', roleConfig.id, targetRole ? 'trouvé' : 'non trouvé');
                if (!targetRole) {
                    return await interaction.reply({
                        content: '❌ Le rôle n\'existe plus. Contactez un administrateur.',
                        ephemeral: true
                    });
                }
            } else {
                targetRole = interaction.guild.roles.cache.find(r => r.name === roleConfig.name);
                console.log('Recherche du rôle par nom:', roleConfig.name, targetRole ? 'trouvé' : 'non trouvé');
                
                // Créer le rôle s'il n'existe pas
                if (!targetRole) {
                    console.log('Tentative de création du rôle:', roleConfig.name);
                    try {
                        targetRole = await interaction.guild.roles.create({
                            name: roleConfig.name,
                            color: roleConfig.color,
                            reason: 'Auto-rôle créé automatiquement'
                        });
                        console.log(`Rôle créé avec succès: ${roleConfig.name}`);
                    } catch (error) {
                        console.error('Erreur lors de la création du rôle:', error);
                        return await interaction.reply({
                            content: '❌ Impossible de créer le rôle. Vérifiez mes permissions.',
                            ephemeral: true
                        });
                    }
                }
            }

            const member = interaction.member;

            // Gérer les rôles existants
            if (interaction.customId.startsWith('role-')) {
                // Retirer les autres rôles de genre
                const genderRoles = ['Fille', 'Garçon', '🚁 de combat'];
                for (const genderName of genderRoles) {
                    if (genderName !== roleConfig.name) {
                        const oldRole = interaction.guild.roles.cache.find(r => r.name === genderName);
                        if (oldRole && member.roles.cache.has(oldRole.id)) {
                            await member.roles.remove(oldRole);
                        }
                    }
                }
            } else if (interaction.customId.startsWith('level-')) {
                // Retirer les autres niveaux
                const levelRoles = interaction.guild.roles.cache.filter(r => 
                    r.name.startsWith('Niveau') && r.id !== targetRole.id
                );
                for (const [_, levelRole] of levelRoles) {
                    if (member.roles.cache.has(levelRole.id)) {
                        await member.roles.remove(levelRole);
                    }
                }
            }

            // Vérifier si le membre a déjà le rôle
            const hasRole = member.roles.cache.has(targetRole.id);
            
            try {
                if (hasRole) {
                    // Retirer le rôle
                    await member.roles.remove(targetRole);
                    await interaction.editReply({ 
                        content: `❌ Le rôle ${targetRole.name} vous a été retiré.`, 
                        ephemeral: true 
                    }).catch(() => {});
                } else {
                    // Ajouter le rôle
                    await member.roles.add(targetRole);
                    await interaction.editReply({ 
                        content: `✅ Le rôle ${targetRole.name} vous a été attribué !`, 
                        ephemeral: true 
                    }).catch(() => {});
                }
            } catch (error) {
                console.error(`Erreur lors de la gestion du rôle ${targetRole.name}:`, error);
                await interaction.reply({
                    content: '❌ Une erreur est survenue lors de la gestion du rôle.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erreur lors de la gestion des auto-rôles:', error);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue lors de la gestion des rôles.', 
                ephemeral: true 
            });
        }
    }
};
