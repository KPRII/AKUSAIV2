const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dictature')
        .setDescription('🔒 être le maitre du jeu')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        
        // Créer un embed pour le message de verrouillage
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🚨 VERROUILLAGE D\'URGENCE')
            .setDescription('Ce salon a été verrouillé par un administrateur.\nVeuillez patienter.')
            .setTimestamp()
            .setFooter({
                text: `Verrouillé par ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

        // Répondre d'abord pour éviter le timeout
        await interaction.reply({
            content: '🔒 Verrouillage des salons en cours...',
            ephemeral: true
        });

        let lockedCount = 0;
        let errorCount = 0;

        // Verrouiller tous les salons textuels
        const channels = guild.channels.cache.filter(channel => 
            channel.type === 0 || // GUILD_TEXT
            channel.type === 2 || // GUILD_VOICE
            channel.type === 13 || // GUILD_STAGE_VOICE
            channel.type === 5 // GUILD_ANNOUNCEMENT
        );

        for (const [_, channel] of channels) {
            try {
                // Sauvegarder les permissions actuelles pour chaque rôle
                const permissions = channel.permissionOverwrites.cache.map(perm => ({
                    id: perm.id,
                    allow: perm.allow.toArray(),
                    deny: perm.deny.toArray()
                }));

                // Verrouiller le salon pour @everyone
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: false,
                    AddReactions: false,
                    CreatePublicThreads: false,
                    CreatePrivateThreads: false,
                    SendMessagesInThreads: false,
                    Connect: false,
                    Speak: false
                });

                // Envoyer le message de verrouillage si c'est un salon textuel
                if (channel.type === 0 || channel.type === 5) {
                    await channel.send({ embeds: [embed] });
                }

                lockedCount++;
            } catch (error) {
                console.error(`Erreur lors du verrouillage du salon ${channel.name}:`, error);
                errorCount++;
            }
        }

        // Mettre à jour le message de réponse
        await interaction.editReply({
            content: `🔒 Verrouillage terminé !\n✅ ${lockedCount} salons verrouillés\n${errorCount > 0 ? `❌ ${errorCount} erreurs` : ''}`,
            ephemeral: true
        });
    }
};
