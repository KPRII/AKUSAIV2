const { Events, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config/antibadwords.json');

// Liste de gros mots à surveiller
const badWords = [
    "merde", "putain", "con", "connard", "salaud", "salop", "enfoiré", "bordel", 
    "enculé", "pute", "bâtard", "chiotte", "bite", "couille", "foutre", "cul"
];

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        try {
            // Ne rien faire si c'est un bot ou si le message est envoyé en MP
            if (message.author.bot || !message.guild) return;

            // Debug logs
            console.log(`[AntiBadWords Debug] Message reçu de ${message.author.tag}`);
            console.log(`[AntiBadWords Debug] Contenu: ${message.content}`);

            // Charger la configuration
            let config = {};
            try {
                if (fs.existsSync(configPath)) {
                    const rawData = fs.readFileSync(configPath, 'utf8');
                    config = JSON.parse(rawData);
                    console.log('[AntiBadWords Debug] Configuration chargée:', config);
                } else {
                    console.log('[AntiBadWords Debug] Fichier de configuration non trouvé');
                    return;
                }
            } catch (error) {
                console.error('[AntiBadWords] Erreur lors de la lecture du fichier antibadwords.json:', error);
                return;
            }

            const guildId = message.guild.id;
            const isEnabled = config[guildId]?.enabled === true;
            console.log(`[AntiBadWords Debug] AntiBadWords activé pour ${guildId}: ${isEnabled}`);

            // Si le système n'est pas activé, on ne fait rien
            if (!isEnabled) return;

            // Vérifier si c'est un modérateur ou l'owner
            const isStaff = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) || 
                          message.member.permissions.has(PermissionsBitField.Flags.Administrator);
            const isOwner = message.author.id === (await message.guild.fetchOwner()).id;

            console.log(`[AntiBadWords Debug] Utilisateur est staff: ${isStaff}`);
            console.log(`[AntiBadWords Debug] Utilisateur est owner: ${isOwner}`);
            console.log(`[AntiBadWords Debug] Permissions de l'utilisateur:`, message.member.permissions.toArray());

            if (isStaff || isOwner) return;

            // Vérifier si le message contient un gros mot
            const foundBadWord = badWords.some(word => 
                message.content.toLowerCase().split(/\s+/).some(msgWord => 
                    msgWord === word || msgWord.includes(word)
                )
            );
            
            console.log(`[AntiBadWords Debug] Message contient un gros mot: ${foundBadWord}`);

            if (foundBadWord) {
                try {
                    await message.delete();
                    const warning = await message.channel.send({
                        content: `🚫 ${message.author}, les gros mots ne sont pas autorisés ici.`
                    });
                    
                    console.log(`[AntiBadWords] Message supprimé de ${message.author.tag}: ${message.content}`);
                    
                    // Supprimer le message d'avertissement après 5 secondes
                    setTimeout(() => {
                        warning.delete().catch(() => {});
                    }, 5000);
                } catch (err) {
                    console.error('[AntiBadWords] Erreur suppression de message:', err);
                }
            }
        } catch (error) {
            console.error('[AntiBadWords] Erreur dans messageCreate:', error);
        }
    }
};
