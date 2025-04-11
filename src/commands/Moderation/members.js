const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('members')
        .setDescription('Affiche les membres d\'un rôle')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Le rôle dont vous voulez voir les membres')
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const members = role.members;

        // Créer l'embed
        const embed = new EmbedBuilder()
            .setColor('#2f3136')
            .setTitle(`🌟 ${role.name}`)
            .addFields(
                { name: '👥 Nombre de membres', value: `${members.size}`, inline: true }
            );

        // Ajouter la liste des membres
        let memberList = '';
        members.forEach(member => {
            memberList += `${member.user.username}\n`;
        });

        // Si la liste est vide
        if (memberList === '') {
            memberList = 'Aucun membre n\'a ce rôle.';
        }

        // Ajouter la liste à l'embed (en la divisant si nécessaire)
        if (memberList.length > 1024) {
            // Diviser la liste en plusieurs champs si elle est trop longue
            const chunks = memberList.match(/.{1,1024}/g);
            chunks.forEach((chunk, index) => {
                embed.addFields({
                    name: index === 0 ? '📋 Liste des membres' : '📋 Suite',
                    value: chunk
                });
            });
        } else {
            embed.addFields({
                name: '📋 Liste des membres',
                value: memberList
            });
        }

        await interaction.reply({ embeds: [embed] });
    },
};
