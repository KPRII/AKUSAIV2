const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        try {
            const roleMapping = {
                // Genre
                'femme': {
                    name: 'Femme',
                    color: '#FF69B4'
                },
                'homme': {
                    name: 'Homme',
                    color: '#4169E1'
                },
                // Âge
                'mineur': {
                    name: 'Mineur',
                    color: '#87CEEB'
                },
                'majeur': {
                    name: 'Majeur',
                    color: '#4682B4'
                },
                // Statut
                'couple': {
                    name: 'En Couple',
                    color: '#FF1493'
                },
                'celibataire': {
                    name: 'Célibataire',
                    color: '#FF69B4'
                }
            };

            const menuType = interaction.customId.split('-')[1];
            const selectedValue = interaction.values[0];
            const roleInfo = roleMapping[selectedValue];

            if (!roleInfo) {
                return await interaction.reply({
                    content: '❌ Rôle non reconnu',
                    ephemeral: true
                });
            }

            // Trouver ou créer le rôle
            let role = interaction.guild.roles.cache.find(r => r.name === roleInfo.name);
            if (!role) {
                role = await interaction.guild.roles.create({
                    name: roleInfo.name,
                    color: roleInfo.color,
                    reason: 'Rôle créé pour le système de sélection'
                });
            }

            // Gérer les rôles mutuellement exclusifs
            const exclusiveRoles = {
                'gender': ['Femme', 'Homme'],
                'age': ['Mineur', 'Majeur'],
                'status': ['En Couple', 'Célibataire']
            };

            // Retirer les rôles du même groupe
            if (exclusiveRoles[menuType]) {
                const rolesToRemove = exclusiveRoles[menuType].filter(r => r !== roleInfo.name);
                for (const roleName of rolesToRemove) {
                    const roleToRemove = interaction.guild.roles.cache.find(r => r.name === roleName);
                    if (roleToRemove && interaction.member.roles.cache.has(roleToRemove.id)) {
                        await interaction.member.roles.remove(roleToRemove);
                    }
                }
            }

            // Ajouter le nouveau rôle
            await interaction.member.roles.add(role);

            // Si c'est le menu de statut, donner accès au serveur
            if (menuType === 'status') {
                try {
                    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
                    const { tempRoleId, memberRoleId } = config.roles; // Changé de config.verification à config.roles

                    console.log('Configuration chargée:', config);
                    console.log('Rôles actuels:', interaction.member.roles.cache.map(r => r.name));
                    console.log('Rôle temporaire ID:', tempRoleId);
                    console.log('Rôle membre ID:', memberRoleId);

                    // Retirer le rôle temporaire
                    if (tempRoleId) {
                        const tempRole = await interaction.guild.roles.fetch(tempRoleId);
                        if (tempRole) {
                            console.log('Tentative de retrait du rôle temporaire');
                            await interaction.member.roles.remove(tempRole);
                            console.log('Rôle temporaire retiré');
                        }
                    }

                    // Ajouter le rôle membre
                    if (memberRoleId) {
                        const memberRole = await interaction.guild.roles.fetch(memberRoleId);
                        if (memberRole) {
                            console.log('Tentative d\'ajout du rôle membre');
                            await interaction.member.roles.add(memberRole);
                            console.log('Rôle membre ajouté');
                        }
                    }

                    // Vérifier les rôles après modification
                    console.log('Rôles après modification:', interaction.member.roles.cache.map(r => r.name));

                    await interaction.reply({
                        content: '✅ Vérification terminée ! Vous avez maintenant accès au serveur.',
                        ephemeral: true
                    });
                    return;
                } catch (error) {
                    console.error('Erreur détaillée:', error);
                    await interaction.reply({
                        content: '❌ Une erreur est survenue lors de la finalisation de la vérification.',
                        ephemeral: true
                    });
                    return;
                }
            }

            // Message de confirmation normal pour les autres menus
            await interaction.reply({
                content: `✅ Vous avez reçu le rôle **${roleInfo.name}**`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur dans le gestionnaire de menus:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la sélection du rôle.',
                ephemeral: true
            });
        }
    }
};
