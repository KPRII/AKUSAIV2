const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Ajoute un nouvel emoji au serveur')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Le nom de l\'emoji')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('url')
                .setDescription('L\'URL de l\'image de l\'emoji')
                .setRequired(true)),

    async execute(interaction) {
        const name = interaction.options.getString('nom');
        const url = interaction.options.getString('url');

        try {
            // Vérifiez que l'URL est une image valide
            const response = await fetch(url);
            if (!response.ok) throw new Error('L\'image n\'a pas pu être récupérée.');
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Créez l'emoji avec le buffer de l'image
            const emoji = await interaction.guild.emojis.create({ attachment: buffer, name: name });
            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Emoji Ajouté')
                .setDescription(`L'emoji ${emoji} a été ajouté avec succès!`)
                .setThumbnail(url)
                .addFields(
                    { name: 'Nom de l\'emoji', value: name, inline: true },
                    { name: 'ID de l\'emoji', value: emoji.id, inline: true }
                )
                .setFooter({ text: 'Emoji Ajouté', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `Une erreur s'est produite lors de l'ajout de l'emoji: ${error.message}`, ephemeral: true });
        }
    },
};
