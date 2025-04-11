const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojiunlarge')
        .setDescription('Affiche un emoji en taille réelle.')
        .addStringOption(option => 
            option.setName('emoji')
                .setDescription('L\'emoji à afficher en grand')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        try {
            const emojiInput = interaction.options.getString('emoji');
            const emojiRegex = /<a?:(\w+):(\d+)>/;
            const match = emojiInput.match(emojiRegex);

            if (!match) {
                return await interaction.reply({ 
                    content: '❌ Cet emoji n\'est pas valide. Veuillez spécifier un emoji personnalisé de serveur.', 
                    ephemeral: true 
                });
            }

            const emojiName = match[1];
            const emojiId = match[2];
            const isAnimated = emojiInput.startsWith('<a:');

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`;

            const embed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('Emoji en taille réelle')
                .setDescription(`Nom : \`${emojiName}\` | ID : \`${emojiId}\``)
                .setImage(emojiURL)
                .setFooter({ 
                    text: `Commandé par ${interaction.user.tag}`, 
                    iconURL: interaction.user.displayAvatarURL() 
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erreur dans la commande emojiunlarge:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.', 
                    ephemeral: true 
                });
            }
        }
    }
};
