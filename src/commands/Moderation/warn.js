const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warnsPath = path.join(__dirname, '../../config/warns.json');

// Fonction pour charger les warns
function loadWarns() {
    try {
        if (!fs.existsSync(warnsPath)) {
            const emptyWarns = {};
            fs.writeFileSync(warnsPath, JSON.stringify(emptyWarns, null, 4));
            return emptyWarns;
        }
        const data = fs.readFileSync(warnsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des warns:', error);
        return {};
    }
}

// Fonction pour sauvegarder les warns
function saveWarns(warns) {
    try {
        fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 4));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des warns:', error);
    }
}

// Fonction pour obtenir la durée de l'exclusion en fonction du nombre de warns
function getTimeoutDuration(warnCount) {
    if (warnCount >= 20) return -1; // Ban définitif
    if (warnCount >= 10) return 10 * 60 * 1000; // 10 minutes
    if (warnCount >= 5) return 5 * 60 * 1000; // 5 minutes
    return 60 * 1000; // 1 minute
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertit un utilisateur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('L\'utilisateur à avertir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Raison de l\'avertissement')
                .setRequired(false)),

    async execute(interaction) {
        try {
            // Vérifier les permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: '❔ Vous n\'avez pas la permission d\'utiliser cette commande!', ephemeral: true });
            }

            const targetUser = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'Aucune raison fournie.';
            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // Vérifier si on peut modérer l'utilisateur
            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return await interaction.reply({ content: '❔ Je ne peux pas modérer cet utilisateur car son rôle est plus haut que le mien.', ephemeral: true });
            }

            // Mettre à jour le compteur d'avertissements
            const warns = loadWarns();
            const guildId = interaction.guild.id;
            const userId = targetUser.id;
            
            if (!warns[guildId]) warns[guildId] = {};
            if (!warns[guildId][userId]) warns[guildId][userId] = 0;
            warns[guildId][userId]++;
            
            const warnCount = warns[guildId][userId];
            saveWarns(warns);

            // Déterminer la durée de l'exclusion
            const timeoutDuration = getTimeoutDuration(warnCount);
            
            if (timeoutDuration === -1) {
                // Ban définitif
                try {
                    await targetMember.ban({
                        reason: `20 avertissements accumulés. Dernier avertissement: ${reason}`,
                        deleteMessageSeconds: 604800 // Supprime les messages des 7 derniers jours
                    });
                    return await interaction.reply(`⛔ ${targetUser.tag} a été banni définitivement après avoir accumulé 20 avertissements.`);
                } catch (error) {
                    console.error('Erreur lors du bannissement:', error);
                    return await interaction.reply({ content: '❌ Impossible de bannir l\'utilisateur.', ephemeral: true });
                }
            }

            // Appliquer l'exclusion temporaire
            try {
                await targetMember.timeout(timeoutDuration, `Warn #${warnCount}: ${reason}`);
            } catch (error) {
                console.error('Erreur lors de l\'exclusion temporaire:', error);
                return await interaction.reply({ content: '❌ Impossible d\'exclure temporairement l\'utilisateur.', ephemeral: true });
            }

            // Calculer la durée en minutes pour l'affichage
            const durationMinutes = timeoutDuration / 60000;

            // Répondre à la commande
            await interaction.reply(
                `✅ ${targetUser.tag} a reçu son ${warnCount}e avertissement et a été exclu pour ${durationMinutes} minute(s).\n` +
                `Raison: ${reason}`
            );

            // Envoyer un DM à l'utilisateur
            try {
                await targetUser.send(
                    `Vous avez reçu votre ${warnCount}e avertissement dans ${interaction.guild.name}.\n` +
                    `Vous avez été exclu pour ${durationMinutes} minute(s).\n` +
                    `Raison: ${reason}\n\n` +
                    `⚠️ Au bout de 20 avertissements, vous serez banni définitivement.`
                );
            } catch (err) {
                console.log('Impossible d\'envoyer un DM à l\'utilisateur');
            }

        } catch (error) {
            console.error('Erreur dans la commande warn:', error);
            await interaction.reply({ content: '❔ Une erreur est survenue lors de l\'exécution de la commande.', ephemeral: true });
        }
    }
};
