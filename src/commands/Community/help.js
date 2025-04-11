const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles.'),
    async execute(interaction) {
        const commands = interaction.client.commands.map(command => {
            return {
                name: `/${command.data.name}`,
                description: command.data.description || 'Pas de description disponible.'
            };
        });

        // Liste des commandes visibles par les membres non-admin
        const memberCommands = [
            '/addeemoji',
            '/botstatscommand',
            '/emojiunlarge',
            '/mention',
            '/ping',
            '/ticket'
        ];

        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const filteredCommands = isAdmin ? commands : commands.filter(command => memberCommands.includes(command.name));

        const embeds = [];
        const chunkSize = 25; // Discord autorise jusqu'à 25 champs par embed

        for (let i = 0; i < filteredCommands.length; i += chunkSize) {
            const currentChunk = filteredCommands.slice(i, i + chunkSize);
            const embed = new EmbedBuilder()
                .setColor('#000000')
                .setTitle('Commandes du bot')
                .setDescription('Voici la liste des commandes disponibles :')
                .setFooter({ text: 'Utilise ces commandes pour interagir avec le bot !', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            currentChunk.forEach(command => {
                embed.addFields({ name: command.name, value: command.description });
            });

            embeds.push(embed);
        }

        await interaction.reply({ embeds });
    }
};
