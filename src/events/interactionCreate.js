const { Events } = require('discord.js');
const configManager = require('../utils/configManager');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        try {
            // Gestion des commandes slash
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error('Erreur lors de l\'exécution de la commande:', error);
                    const errorMessage = {
                        content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                        ephemeral: true
                    };
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply(errorMessage);
                    } else {
                        await interaction.reply(errorMessage);
                    }
                }
            }

            // Gestion des commandes contextuelles
            if (interaction.isContextMenuCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error('Erreur lors de l\'exécution de la commande contextuelle:', error);
                    const errorMessage = {
                        content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
                        ephemeral: true
                    };
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply(errorMessage);
                    } else {
                        await interaction.reply(errorMessage);
                    }
                }
            }

            // Gestion des auto-complétions
            if (interaction.isAutocomplete()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try {
                    await command.autocomplete(interaction);
                } catch (error) {
                    console.error('Erreur lors de l\'auto-complétion:', error);
                }
            }
        } catch (error) {
            console.error('Erreur dans l\'événement interactionCreate:', error);
            try {
                if (interaction.deferred) {
                    await interaction.editReply({ content: '❌ Une erreur est survenue', ephemeral: true });
                } else {
                    await interaction.reply({ content: '❌ Une erreur est survenue', ephemeral: true });
                }
            } catch (replyError) {
                console.error('Erreur lors de la réponse:', replyError);
            }
        }
    },
};
