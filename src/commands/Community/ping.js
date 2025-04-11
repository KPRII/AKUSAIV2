const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.token);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Renvoie la latence du bot et la latence de l\'API Discord.'),

    async execute(interaction) {
        if (!interaction.client.isReady()) {
            return interaction.reply({ content: 'Le bot n\'est pas prêt.', ephemeral: true });
        }

        const botPing = interaction.client.ws.ping >= 0 ? interaction.client.ws.ping : 'N/A';

        const apiPingStart = Date.now();
        await interaction.deferReply(); // Retarde la réponse pour pouvoir utiliser msg.edit
        const msg = await interaction.editReply({ content: 'Calcul de la latence...', fetchReply: true });
        const apiPingEnd = Date.now();
        const apiPing = apiPingEnd - apiPingStart;

        const embed = new EmbedBuilder()
            .setTitle('Pong! 🏓')
            .setDescription(`**Latence du bot :** ${botPing}ms\n**Latence de l'API Discord :** ${apiPing}ms`)
            .setColor('#000000') 
            .setFooter({ text: 'Bot développé par kvpri.ph', iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            .setThumbnail(client.user.displayAvatarURL())
            .setFields(
                { name: 'Détails supplémentaires', value: 'Le bot et l\'API répondent à la vitesse de l\'éclair!' }
            );

        await msg.edit({ content: null, embeds: [embed] });
    },
};
