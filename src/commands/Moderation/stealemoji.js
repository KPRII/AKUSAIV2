const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('volez un emoji d\'un serveur.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) // Limite l'accès aux administrateurs
        .addStringOption(option => option.setName('emoji').setDescription('l\'emoji que vous voulez').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Le nom de que vous voulez donnez').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            return await interaction.reply({ content: `Tu n'as pas les permissions pour la commande!`, ephemeral: true });
        }

        let emoji = interaction.options.getString('emoji')?.trim();
        const name = interaction.options.getString('name');

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
                if (image) return "gif"
                else return "png"
            }).catch(err => {
                return "png"
            });

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
        }

        if (emoji.startsWith('<a') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];
            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`).then(image => {
                if (image) return "png"
                else return "gif"
            }).catch(err => {
                return "gif"
            });

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
        }

        if (!emoji.startsWith('http')) {
            return await interaction.reply({ content: `Tu ne peux pas voler un emoji`, ephemeral: true });
        }

        if (!emoji.startsWith('https')) {
            return await interaction.reply({ content: `Tu ne peux pas voler un emoji`, ephemeral: true });
        }

        interaction.guild.emojis.create({ attachment: `${emoji}`, name: `${name}` })
            .then(emoji => {
                const embed = new EmbedBuilder()
                    .setColor('#000000')
                    .setDescription(`Ajouté **Correctement** ${emoji}, avec le nom: **${name}**.`);

                return interaction.editReply({ embeds: [embed] }).catch(err => {
                    interaction.editReply({ content: "Vous avez atteint le nombre maximum d'emojis", ephemeral: true });
                });
            });
    }
};
