const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête le bot')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Limite l'accès aux administrateurs

    async execute(interaction) {
        // Vérifiez si l'utilisateur a les permissions d'administrateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande. Vous allez être expulsé du serveur.', ephemeral: true });

            // Envoyer un message privé à l'utilisateur
            try {
                await interaction.user.send('Oh oh! Tentative non autorisée d\'utiliser la commande stop. À la prochaine, et bon vent! 🌬️');
            } catch (error) {
                console.error('Erreur lors de l\'envoi du DM à l\'utilisateur :', error);
            }
            
            // Expulsez l'utilisateur du serveur
            try {
                await interaction.member.kick('Tentative d\'utilisation de la commande stop sans autorisation.');
            } catch (error) {
                console.error('Erreur lors de l\'expulsion de l\'utilisateur :', error);
            }

            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Arrêt du bot')
            .setDescription('Le bot va s\'arrêter dans quelques secondes.');

        await interaction.reply({ embeds: [embed] });

        // Attendez quelques secondes avant d'arrêter le bot
        setTimeout(() => {
            interaction.client.destroy();
            process.exit();
        }, 5000);
    },
};
