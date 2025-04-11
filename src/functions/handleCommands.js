const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleCommands = async (commandFolders, path) => {
        client.commandArray = [];
        
        // Parcourir tous les dossiers de commandes
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${path}/${folder}`).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                
                // Enregistrer la commande dans la collection
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.token);
        const clientId = process.env.clientId;

        if (!clientId) {
            console.error('Erreur: clientId non défini dans les variables d\'environnement');
            return;
        }

        try {
            console.log('Début du rafraîchissement des commandes (/).');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );

            console.log('Les commandes (/) ont été rechargées avec succès.');
        } catch (error) {
            console.error('Erreur lors du rafraîchissement des commandes:', error);
            if (error.code === 50035) {
                console.error('Vérifiez que le clientId est correctement défini dans les variables d\'environnement');
            }
        }
    };
};
