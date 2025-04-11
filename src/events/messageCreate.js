const { Events, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/antilink.json');

// regex pour détecter les liens
const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,})/gi;

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        try {
            // Ne rien faire si c'est un bot ou si le message est envoyé en MP
            if (message.author.bot || !message.guild) return;

            // Debug logs
            console.log(`[AntiLink Debug] Message reçu de ${message.author.tag}`);
            console.log(`[AntiLink Debug] Contenu: ${message.content}`);

            // Charger la configuration
            let config = {};
            try {
                if (fs.existsSync(configPath)) {
                    const rawData = fs.readFileSync(configPath, 'utf8');
                    config = JSON.parse(rawData);
                    console.log('[AntiLink Debug] Configuration chargée:', config);
                } else {
                    console.log('[AntiLink Debug] Fichier de configuration non trouvé');
                    return;
                }
            } catch (error) {
                console.error('[AntiLink] Erreur lors de la lecture du fichier antilink.json:', error);
                return;
            }

            const guildId = message.guild.id;
            const isEnabled = config[guildId]?.enabled === true;
            console.log(`[AntiLink Debug] Antilink activé pour ${guildId}: ${isEnabled}`);

            // Si le système n'est pas activé, on ne fait rien
            if (!isEnabled) return;

            // Vérifier si c'est un modérateur ou l'owner
            const isStaff = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) || 
                          message.member.permissions.has(PermissionsBitField.Flags.Administrator);
            const isOwner = message.author.id === (await message.guild.fetchOwner()).id;

            console.log(`[AntiLink Debug] Utilisateur est staff: ${isStaff}`);
            console.log(`[AntiLink Debug] Utilisateur est owner: ${isOwner}`);
            console.log(`[AntiLink Debug] Permissions de l'utilisateur:`, message.member.permissions.toArray());

            if (isStaff || isOwner) return;

            // Vérifier si le message contient un lien
            const hasLink = linkRegex.test(message.content);
            console.log(`[AntiLink Debug] Message contient un lien: ${hasLink}`);

            if (hasLink) {
                try {
                    await message.delete();
                    const warning = await message.channel.send({
                        content: `🚫 ${message.author}, l'envoi de liens est interdit ici.`
                    });
                    
                    console.log(`[AntiLink] Message supprimé de ${message.author.tag}: ${message.content}`);
                    
                    // Supprimer le message d'avertissement après 5 secondes
                    setTimeout(() => {
                        warning.delete().catch(() => {});
                    }, 5000);
                } catch (err) {
                    console.error('[AntiLink] Erreur suppression de message:', err);
                }
            }
        } catch (error) {
            console.error('[AntiLink] Erreur dans messageCreate:', error);
        }
    }
};
