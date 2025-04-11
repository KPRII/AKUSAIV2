const fs = require('fs');
const { EmbedBuilder, ChannelType } = require('discord.js');

// Fonction pour créer les canaux de statistiques
async function createStatsChannels(guild) {
    // Créer une catégorie pour les stats
    const category = await guild.channels.create({
        name: '📊 Statistiques',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [{
            id: guild.roles.everyone.id,
            deny: ['SendMessages', 'Connect'],
            allow: ['ViewChannel']
        }]
    });

    // Créer les salons vocaux
    const totalChannel = await guild.channels.create({
        name: '🍒・Total : 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{
            id: guild.roles.everyone.id,
            deny: ['SendMessages', 'Connect'],
            allow: ['ViewChannel']
        }]
    });

    const membersChannel = await guild.channels.create({
        name: '赤・Members : 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{
            id: guild.roles.everyone.id,
            deny: ['SendMessages', 'Connect'],
            allow: ['ViewChannel']
        }]
    });

    const botsChannel = await guild.channels.create({
        name: '🍙・Bots : 0',
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [{
            id: guild.roles.everyone.id,
            deny: ['SendMessages', 'Connect'],
            allow: ['ViewChannel']
        }]
    });

    // Sauvegarder la configuration
    const config = {
        statsChannels: {
            categoryId: category.id,
            totalId: totalChannel.id,
            membersId: membersChannel.id,
            botsId: botsChannel.id
        }
    };

    fs.writeFileSync('./src/config/stats.json', JSON.stringify(config, null, 4));
    return config.statsChannels;
}

// Fonction principale pour mettre à jour les statistiques
async function updateStats(guild) {
    try {
        let config;
        try {
            config = JSON.parse(fs.readFileSync('./src/config/stats.json', 'utf8'));
        } catch (error) {
            console.log('Configuration non trouvée, création des canaux...');
            config = { statsChannels: await createStatsChannels(guild) };
            return;
        }

        // Récupérer tous les membres une seule fois
        const members = await guild.members.fetch();
        const totalMembers = members.size;
        const memberCount = members.filter(member => !member.user.bot).size;
        const botCount = members.filter(member => member.user.bot).size;

        // Mettre à jour les canaux s'ils existent
        const updateChannel = async (channelId, newName) => {
            try {
                const channel = await guild.channels.fetch(channelId);
                if (channel && channel.type === ChannelType.GuildVoice) {
                    await channel.setName(newName);
                }
            } catch (error) {
                if (error.code === 10003) { // Unknown Channel
                    console.log(`Canal ${channelId} non trouvé, recréation des canaux...`);
                    await createStatsChannels(guild);
                    return true;
                }
                console.error(`Erreur lors de la mise à jour du canal ${channelId}:`, error);
            }
            return false;
        };

        const { totalId, membersId, botsId } = config.statsChannels;

        // Mettre à jour chaque canal
        const updates = [
            updateChannel(totalId, `🍒・Total : ${totalMembers}`),
            updateChannel(membersId, `赤・Members : ${memberCount}`),
            updateChannel(botsId, `🍙・Bots : ${botCount}`)
        ];

        // Si un canal a été recréé, on arrête là
        if (await Promise.all(updates).then(results => results.includes(true))) {
            return;
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // Activer les intents nécessaires
        client.guilds.cache.forEach(async (guild) => {
            await updateStats(guild);
        });

        // Mettre à jour les stats toutes les 5 minutes
        setInterval(async () => {
            client.guilds.cache.forEach(async (guild) => {
                await updateStats(guild);
            });
        }, 5 * 60 * 1000);
    }
};

// Exporter les fonctions
module.exports = {
    createStatsChannels,
    updateStats
};
// Événements pour la mise à jour des stats
['guildMemberAdd', 'guildMemberRemove', 'guildMemberUpdate'].forEach(event => {
    module.exports[event] = {
        name: event,
        async execute(member) {
            if (member.guild) {
                await updateStats(member.guild);
            }
        }
    };
});
