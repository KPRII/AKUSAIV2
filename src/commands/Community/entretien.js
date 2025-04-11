const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fonction pour lire le statut de l'entretien
function getInterviewStatus() {
    const statusPath = path.join(__dirname, '..', '..', 'config', 'interview-status.json');
    if (!fs.existsSync(statusPath)) {
        fs.writeFileSync(statusPath, JSON.stringify({ inProgress: false, currentChannelId: null }));
    }
    return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
}

// Fonction pour sauvegarder le statut de l'entretien
function saveInterviewStatus(status) {
    const statusPath = path.join(__dirname, '..', '..', 'config', 'interview-status.json');
    fs.writeFileSync(statusPath, JSON.stringify(status));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('entretien')
        .setDescription('Gérer les entretiens')
        .addSubcommand(subcommand =>
            subcommand
                .setName('postuler')
                .setDescription('Faire une demande d\'entretien pour devenir Raider Officiel')
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Le rôle souhaité')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Raider Officiel', value: 'raider' },
                            { name: 'Modérateur', value: 'moderator' },
                            { name: 'Autre', value: 'other' }
                        ))
                .addStringOption(option =>
                    option.setName('motivation')
                        .setDescription('Votre motivation pour ce rôle')
                        .setRequired(true)
                        .setMaxLength(1000)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Réinitialiser le système d\'entretien (Modérateurs uniquement)')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'reset') {
            // Vérifier les permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return await interaction.reply({
                    content: '❌ Vous n\'avez pas la permission de réinitialiser le système d\'entretien.',
                    ephemeral: true
                });
            }

            // Réinitialiser le statut
            saveInterviewStatus({
                inProgress: false,
                currentChannelId: null
            });

            return await interaction.reply({
                content: '✅ Le système d\'entretien a été réinitialisé avec succès.',
                ephemeral: true
            });
        }
        // Sous-commande postuler
        const member = interaction.member;
        const guild = interaction.guild;

        // Vérifier si le membre est dans un salon vocal
        if (!member.voice.channel) {
            return await interaction.reply({
                content: '❌ Vous devez être dans un salon vocal pour faire une demande d\'entretien !',
                ephemeral: true
            });
        }

        const role = interaction.options.getString('role');
        const motivation = interaction.options.getString('motivation');

        // Vérifier si un entretien est déjà en cours
        const status = getInterviewStatus();
        if (status.inProgress) {
            return await interaction.reply({
                content: '❌ Un entretien est déjà en cours. Veuillez patienter.',
                ephemeral: true
            });
        }

        // Vérifier/créer la catégorie et le salon vocal d'entretien
        let category = guild.channels.cache.find(c => c.name === '📋 Entretiens' && c.type === ChannelType.GuildCategory);
        if (!category) {
            category = await guild.channels.create({
                name: '📋 Entretiens',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
        }

        let voiceChannel = guild.channels.cache.find(c => c.name === '🎙️-entretien' && c.type === ChannelType.GuildVoice);
        if (!voiceChannel) {
            voiceChannel = await guild.channels.create({
                name: '🎙️-entretien',
                type: ChannelType.GuildVoice,
                parent: category,
                userLimit: 5,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
        }

        // Créer un embed avec les informations du candidat
        const embed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setTitle('📝 Nouvelle candidature')
            .setDescription(`**Candidat:** ${member}
**Rôle souhaité:** ${role === 'raider' ? 'Raider Officiel' : role === 'moderator' ? 'Modérateur' : 'Autre'}
            
**Motivation:**
${motivation}`)
            .setTimestamp()
            .setFooter({
                text: `ID: ${member.id}`,
                iconURL: member.displayAvatarURL({ dynamic: true })
            });

        // Créer les boutons pour gérer la candidature
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_interview')
                    .setLabel('Accepter')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('reject_interview')
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Danger)
            );

        // Trouver ou créer le salon pour les candidatures
        let candidatureChannel = guild.channels.cache.find(c => c.name === '📋-candidatures' && c.type === ChannelType.GuildText);
        if (!candidatureChannel) {
            candidatureChannel = await guild.channels.create({
                name: '📋-candidatures',
                type: ChannelType.GuildText,
                parent: category,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
        }

        // Marquer l'entretien comme en cours
        saveInterviewStatus({
            inProgress: true,
            currentChannelId: voiceChannel.id
        });

        // Envoyer l'embed dans le salon des candidatures
        await candidatureChannel.send({
            embeds: [embed],
            components: [buttons]
        });

        // Répondre au candidat
        await interaction.reply({
            content: '✅ Votre candidature a été enregistrée ! Un modérateur vous contactera bientôt pour l\'entretien.',
            ephemeral: true
        });
    }
};
