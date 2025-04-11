const fs = require('fs');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('Ready!');

        // Chargement des commandes
        const commandFolders = fs.readdirSync("./src/commands");
        await client.handleCommands(commandFolders, "./src/commands");

        const activity = [
            'Fait un tour dans les channels de akusai!',
            'Regarde comment gérer le server',
            'Joue a Roblox'
        ]

        setInterval(()  => {
            const botStatus = activity[Math.floor(Math.random() * activity.length)];
            client.user.setPresence({ activities: [{ name: `${botStatus}` }]});
        }, 3000);

        async function pickPresence () {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,

                        },
                    
                    ],

                    status: statusArray[option].status
                })
            } catch (error) {
                console.error(error);
            }
        }
    },
};

