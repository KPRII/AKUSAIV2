const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fonction pour lire le statut de l'entretien
function getInterviewStatus() {
    const statusPath = path.join(__dirname, '..', 'config', 'interview-status.json');
    if (!fs.existsSync(statusPath)) {
        fs.writeFileSync(statusPath, JSON.stringify({ inProgress: false, currentChannelId: null }));
    }
    return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
}

// Fonction pour sauvegarder le statut de l'entretien
function saveInterviewStatus(status) {
    const statusPath = path.join(__dirname, '..', 'config', 'interview-status.json');
    fs.writeFileSync(statusPath, JSON.stringify(status));
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) return;

        const buttonId = interaction.customId;
        if (!['accept_interview', 'reject_interview', 'end_interview'].includes(buttonId)) return;

        try {

        if (buttonId === 'end_interview') {
            const status = getInterviewStatus();
            if (!status.inProgress) {
                return await interaction.reply({
                    content: '❌ Aucun entretien en cours.',
                    ephemeral: true
                });
            }

            // Réinitialiser les permissions du salon vocal
            const voiceChannel = interaction.guild.channels.cache.get(status.currentChannelId);
            if (!voiceChannel) {
                saveInterviewStatus({ inProgress: false, currentChannelId: null });
                return await interaction.reply({
                    content: '❌ Le salon vocal n\'existe plus.',
                    ephemeral: true
                });
            }

            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: false,
                Connect: false,
                Speak: false
            });

            // Réinitialiser le statut
            saveInterviewStatus({ inProgress: false, currentChannelId: null });

            // Mettre à jour l'embed
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor('#00ff00')
                .addFields({ name: 'Status', value: '✅ Entretien terminé', inline: true });

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: []
            });

            await interaction.reply({
                content: '✅ Entretien terminé avec succès !',
                ephemeral: true
            });
            return;
        }

        if (buttonId === 'accept_interview') {
            // Extraire l'ID du candidat depuis le footer de l'embed
            const candidateId = interaction.message.embeds[0].footer.text.split(': ')[1];
            const candidate = await interaction.guild.members.fetch(candidateId).catch(() => null);
            
            if (!candidate) {
                saveInterviewStatus({ inProgress: false, currentChannelId: null });
                return await interaction.reply({
                    content: '❌ Candidat introuvable.',
                    ephemeral: true
                });
            }
            // Trouver le salon vocal d'entretien
            const voiceChannel = interaction.guild.channels.cache.find(c => c.name === '🎙️-entretien');
            if (!voiceChannel) {
                return await interaction.reply({
                    content: '❌ Le salon vocal d\'entretien est introuvable.',
                    ephemeral: true
                });
            }

            // Donner les permissions au candidat
            await voiceChannel.permissionOverwrites.edit(candidate, {
                ViewChannel: true,
                Connect: true,
                Speak: true
            });

            // Créer un embed de notification
            const notifEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setTitle('🎙️ Entretien accepté !')
                .setDescription(`Votre entretien a été accepté ! Veuillez rejoindre le salon vocal <#${voiceChannel.id}> quand vous êtes prêt(e).
                
**Questions qui vous seront posées :**
1. Présentez-vous brièvement
2. Pourquoi souhaitez-vous ce rôle ?
3. Quelle est votre expérience ?
4. Quelles sont vos disponibilités ?
5. Comment comptez-vous contribuer ?

⚠️ Préparez vos réponses à l'avance !`)
                .setTimestamp();

            // Notifier le candidat en MP
            try {
                await candidate.send({ embeds: [notifEmbed] });
            } catch (error) {
                console.error('Impossible d\'envoyer un MP au candidat:', error);
            }

            // Mettre à jour le message original
            const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor('#00ff00')
                .addFields({ name: 'Status', value: '✅ Entretien accepté', inline: true });

            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: []
            });

            await interaction.reply({
                content: `✅ Entretien accepté pour ${candidate}. Le candidat a été notifié.`,
                ephemeral: true
            });
        }
        else if (buttonId === 'reject_interview') {
            try {
                // Réinitialiser le statut
                saveInterviewStatus({ inProgress: false, currentChannelId: null });

                // Mettre à jour l'embed
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setColor('#ff0000')
                    .addFields({ name: 'Status', value: '❌ Candidature refusée', inline: true });

                await interaction.message.edit({
                    embeds: [updatedEmbed],
                    components: []
                });

                // Notifier le candidat
                const candidateId = interaction.message.embeds[0].footer.text.split(': ')[1];
                const candidate = await interaction.guild.members.fetch(candidateId).catch(() => null);
                
                if (candidate) {
                    try {
                        await candidate.send('❌ Votre candidature n\'a malheureusement pas été retenue pour le moment.');
                    } catch (error) {
                        console.error('Impossible d\'envoyer un MP au candidat:', error);
                    }
                }

                await interaction.reply({
                    content: '❌ Candidature refusée.',
                    ephemeral: true
                });
            } catch (error) {
                console.error('Erreur lors du refus de la candidature:', error);
                saveInterviewStatus({ inProgress: false, currentChannelId: null });
                await interaction.reply({
                    content: '❌ Une erreur est survenue. Le système a été réinitialisé.',
                    ephemeral: true
                }).catch(() => {});
            }
            return;
        }

        } catch (error) {
            console.error('Erreur lors du traitement du bouton:', error);
            // En cas d'erreur, réinitialiser le statut
            saveInterviewStatus({ inProgress: false, currentChannelId: null });
            await interaction.reply({
                content: '❌ Une erreur est survenue. Le système a été réinitialisé.',
                ephemeral: true
            }).catch(() => {});
        }
    }
};
