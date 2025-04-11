const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.handleEvents = async (eventFiles, eventsPath) => {
        // Lire tous les fichiers dans le dossier events
        const folders = fs.readdirSync(eventsPath);

        for (const folder of folders) {
            const folderPath = path.join(eventsPath, folder);
            const stats = fs.statSync(folderPath);

            if (stats.isDirectory()) {
                // Si c'est un dossier, lire tous les fichiers .js dedans
                const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of files) {
                    const filePath = path.join(folderPath, file);
                    const event = require(filePath);
                    console.log(`Loading event from ${filePath}:`, event.name);
                    if (event.once) {
                        client.once(event.name, (...args) => event.execute(...args));
                    } else {
                        client.on(event.name, (...args) => event.execute(...args));
                    }
                }
            } else if (folder.endsWith('.js')) {
                // Si c'est un fichier .js à la racine
                const filePath = path.join(eventsPath, folder);
                const event = require(filePath);
                console.log(`Loading event from ${filePath}:`, event.name);
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
            }
        }
    };
};
