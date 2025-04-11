const { REST } = require("@discordjs/rest");
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        client.commands = new Map(); // Initialise la Map

        const commandNames = new Set(); // Pour éviter les doublons

        for (const folder of commandFolders) {
            // Vérifie que c'est bien un dossier
            if (!fs.statSync(`${path}/${folder}`).isDirectory()) continue;

            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                try {
                    const filePath = `${path}/${folder}/${file}`;
                    console.log(`Tentative de chargement : ${folder}/${file}`);

                    const command = require(`../commands/${folder}/${file}`);

                    // Vérifie que la commande est bien structurée
                    if (!command || !command.data || !command.data.name || !command.execute) {
                        console.warn(`[⚠️] La commande dans ${folder}/${file} est invalide (manque "data", "data.name" ou "execute").`);
                        continue;
                    }

                    const cmdName = command.data.name;

                    if (commandNames.has(cmdName)) {
                        console.warn(`[⚠️] Nom de commande "${cmdName}" en double trouvé dans ${folder}/${file}.`);
                        continue;
                    }

                    commandNames.add(cmdName);
                    client.commands.set(cmdName, command);
                    client.commandArray.push(command.data.toJSON());

                    console.log(`[✅] Commande chargée : ${cmdName}`);
                } catch (error) {
                    console.error(`[❌] Erreur lors du chargement de ${folder}/${file} :`, error);
                }
            }
        }

        // Déploiement des commandes avec REST
        const rest = new REST({ version: '10' }).setToken(process.env.token);

        try {
            console.log('🔄 Mise à jour des commandes (/) ...');
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.commandArray }
            );
            console.log('✅ Commandes (/) mises à jour avec succès.');
        } catch (error) {
            console.error('❌ Erreur lors du déploiement des commandes :', error);
        }
    };
};
