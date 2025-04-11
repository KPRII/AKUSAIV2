const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Chemin vers le fichier de configuration des warns
const warnsPath = path.join(__dirname, '../../config/warns.json');

// Fonction pour charger les warns
function loadWarns() {
    try {
        if (!fs.existsSync(warnsPath)) {
            const emptyWarns = {};
            fs.writeFileSync(warnsPath, JSON.stringify(emptyWarns, null, 4));
            return emptyWarns;
        }
        const data = fs.readFileSync(warnsPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lors du chargement des warns:', error);
        return {};
    }
}

// Fonction pour sauvegarder les warns
function saveWarns(warns) {
    try {
        fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 4));
        // Vérification que les données ont été sauvegardées correctement
        const savedData = fs.readFileSync(warnsPath, 'utf-8');
        console.log('Données sauvegardées:', savedData);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des warns:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Retire un avertissement à un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à qui retirer l\'avertissement')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const targetMember = await interaction.guild.members.fetch(interaction.options.getUser('utilisateur').id);
            console.log(`Tentative de retrait d'avertissement pour ${targetMember.user.tag}`);

            let warnsData = loadWarns();
console.log('État initial des warns:', JSON.stringify(warnsData, null, 2));
            console.log('État actuel des warns:', warnsData);
            
            const guildId = interaction.guild.id;
            const userId = targetMember.id;

            // Initialiser la structure si elle n'existe pas
            if (!warnsData[guildId]) {
                warnsData[guildId] = {};
            }
            if (!warnsData[guildId][userId]) {
                warnsData[guildId][userId] = 0;
            }

            // Vérifier si l'utilisateur a des avertissements
            if (warnsData[guildId][userId] <= 0) {
                console.log(`Aucun avertissement trouvé pour ${targetMember.user.tag}`);
                return await interaction.reply({ 
                    content: `❌ ${targetMember.user.username} n'a aucun avertissement à retirer.`, 
                    ephemeral: true 
                });
            }

            // Retirer un avertissement
            warnsData[guildId][userId]--;
            console.log(`Avertissement retiré, nouveau compte: ${warnsData[guildId][userId]}`);

            // Si l'utilisateur n'a plus d'avertissements, supprimer son entrée
            if (warnsData[guildId][userId] === 0) {
                console.log(`Suppression de l'entrée pour ${targetMember.user.tag} car plus d'avertissements`);
                delete warnsData[guildId][userId];
                // Si le serveur n'a plus d'avertissements, supprimer son entrée
                if (Object.keys(warnsData[guildId]).length === 0) {
                    console.log(`Suppression de l'entrée du serveur car plus d'avertissements`);
                    delete warnsData[guildId];
                }
            }

            // Sauvegarder les modifications
            saveWarns(warnsData);

            await interaction.reply({
                content: `✅ Un avertissement a été retiré à ${targetMember.user.username}. Nombre d'avertissements restants : ${warnsData[guildId]?.[userId] || 0}`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur dans la commande unwarn:', error);
            await interaction.reply({ 
                content: '❌ Une erreur est survenue lors de l\'exécution de la commande.', 
                ephemeral: true 
            });
        }
    },
};
