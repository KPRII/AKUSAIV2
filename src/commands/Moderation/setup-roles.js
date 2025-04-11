const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const configManager = require('../../utils/configManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('Configure le système de vérification en deux étapes')
        .addChannelOption(option =>
            option.setName('verification_channel')
                .setDescription('Le salon de vérification avec le règlement')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('roles_channel')
                .setDescription('Le salon pour choisir les rôles')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('temp_role')
                .setDescription('Rôle temporaire après validation du règlement')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('member_role')
                .setDescription('Rôle final de membre')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async function(interaction) {
        try {
            const verificationChannel = interaction.options.getChannel('verification_channel');
            const rolesChannel = interaction.options.getChannel('roles_channel');
            const tempRole = interaction.options.getRole('temp_role');
            const memberRole = interaction.options.getRole('member_role');

            // Vérifier les permissions du bot
            const botMember = await interaction.guild.members.fetchMe();
            if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return await interaction.reply({
                    content: '❌ Je n\'ai pas la permission de gérer les rôles !',
                    ephemeral: true
                });
            }

            // Sauvegarder la configuration
            const config = {
                verificationChannelId: verificationChannel.id,
                rolesChannelId: rolesChannel.id,
                tempRoleId: tempRole.id,
                memberRoleId: memberRole.id
            };

            configManager.setGuildConfig(interaction.guild.id, config);

            // Configurer les permissions
            await verificationChannel.permissionOverwrites.set([
                {
                    id: interaction.guild.roles.everyone.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: tempRole.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]);

            await rolesChannel.permissionOverwrites.set([
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: tempRole.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                    deny: [PermissionFlagsBits.SendMessages]
                },
                {
                    id: memberRole.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                }
            ]);

            // Message du règlement
            const rulesEmbed = new EmbedBuilder()
                .setTitle('Bienvenue sur le serveur Akusai !')
                .setColor('#FF69B4')
                .setDescription(`On est ici pour rigoler, partager des bons moments et s'amuser ensemble. MAIS, comme dans toute bonne blague, il y a des limites à respecter. Voici les règles de notre serveur, histoire que l'ambiance reste cool et détendue, sans déraper.

**1. Respect et bienveillance avant tout !**
Les blagues, c'est cool, mais il y a des limites. Le respect des autres membres est primordial. Pas de propos haineux, discriminatoires, sexistes, racistes, homophobes, ou toute forme de harcèlement, même sous forme de "plaisanterie".
Les discussions doivent rester saines et inclusives.

**2. L'humour, mais avec délicatesse.**
On adore tous l'humour décalé, mais il faut savoir ne pas franchir la ligne. Les blagues peuvent être osées, mais ne tombent jamais dans l'extrême. Si tu fais une blague et que quelqu'un est gêné ou mal à l'aise, il suffit de t'excuser et de rester cool.

**3. Pas de spam.**
Envoyer des messages en masse, des gifs en continu ou des spams de liens ne fera rire personne. Restez dans le ton de la conversation et évitez de perturber le chat avec des messages répétitifs.

**4. Pas de contenu NSFW (not safe for work) !**
Même si on aime tous les mèmes un peu osés, ce serveur reste un lieu de partage pour tous les âges. Aucun contenu NSFW, explicite ou inapproprié n'est autorisé, que ce soit en texte, images, vidéos ou autres.

**5. Les discussions sérieuses ? On en a aussi.**
Bien que l'on soit ici pour rigoler, n'oublions pas que des discussions plus sérieuses peuvent avoir lieu. Respecte les moments où les gens veulent parler de choses plus profondes. Les blagues, c'est bien, mais parfois, la bienveillance l'emporte.

**6. Les conflits, on règle ça en privé.**
Si tu as un problème avec quelqu'un, contacte-le en privé. Ne fais pas de disputes publiques qui pourraient gâcher l'ambiance du serveur. Le staff est là pour intervenir si nécessaire, mais on préfère résoudre les choses calmement.

**7. Le staff est là pour veiller sur l'ambiance.**
Les membres du staff sont là pour faire respecter ces règles. En cas de doute, tu peux toujours leur demander. Si un membre du staff te donne un avertissement, écoute-le, et ne sois pas vexé(e). Ils sont là pour maintenir une ambiance saine et amusante pour tout le monde.

**8. Ne partage pas de contenu illégal !**
On est ici pour s'amuser, pas pour enfreindre la loi. Pas de piratage, pas de contenu protégé par des droits d'auteur, et bien sûr, tout ce qui est illégal est strictement interdit.`)
                .setFooter({ text: 'Cliquez sur le bouton ci-dessous pour accéder à la sélection des rôles' });

            const rulesButton = new ButtonBuilder()
                .setCustomId('verify-accept')
                .setLabel('J\'accepte le règlement')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅');

            const rulesRow = new ActionRowBuilder().addComponents(rulesButton);

            await verificationChannel.send({
                embeds: [rulesEmbed],
                components: [rulesRow]
            });

            // Menus de sélection des rôles
            // Genre
            const genderEmbed = new EmbedBuilder()
                .setTitle('👥 Genre')
                .setDescription('Sélectionnez votre genre')
                .setColor('#FF69B4')
                .setImage('https://i.pinimg.com/736x/3b/05/5d/3b055dff292b5f96b7e87bade99a2758.jpg');

            const genderMenu = new StringSelectMenuBuilder()
                .setCustomId('select-gender')
                .setPlaceholder('Choisissez votre genre')
                .addOptions([
                    {
                        label: 'Femme',
                        description: 'Je suis une femme',
                        value: 'femme',
                        emoji: '👩'
                    },
                    {
                        label: 'Homme',
                        description: 'Je suis un homme',
                        value: 'homme',
                        emoji: '👨'
                    }
                ]);

            // Âge
            const ageEmbed = new EmbedBuilder()
                .setTitle('🎂 Âge')
                .setDescription('Sélectionnez votre tranche d\'âge')
                .setColor('#87CEEB')
                .setImage('https://i.pinimg.com/736x/06/9a/2c/069a2c60a49119eda57b1ca7d7a57b71.jpg');

            const ageMenu = new StringSelectMenuBuilder()
                .setCustomId('select-age')
                .setPlaceholder('Choisissez votre âge')
                .addOptions([
                    {
                        label: 'Mineur',
                        description: 'Je suis mineur (-18 ans)',
                        value: 'mineur',
                        emoji: '🔸'
                    },
                    {
                        label: 'Majeur',
                        description: 'Je suis majeur (+18 ans)',
                        value: 'majeur',
                        emoji: '🔹'
                    }
                ]);

            // Statut
            const statusEmbed = new EmbedBuilder()
                .setTitle('💝 Statut')
                .setDescription('Sélectionnez votre statut')
                .setColor('#FF69B4')
                .setImage('https://i.pinimg.com/736x/61/ad/c3/61adc3c0fd101e20082b08057fc48048.jpg')
                .setFooter({ text: 'Une fois votre statut choisi, vous aurez accès au serveur' });

            const statusMenu = new StringSelectMenuBuilder()
                .setCustomId('select-status')
                .setPlaceholder('Choisissez votre statut')
                .addOptions([
                    {
                        label: 'En couple',
                        description: 'Je suis en couple',
                        value: 'couple',
                        emoji: '💑'
                    },
                    {
                        label: 'Célibataire',
                        description: 'Je suis célibataire',
                        value: 'celibataire',
                        emoji: '💝'
                    }
                ]);

            // Créer les rows pour les menus
            const genderRow = new ActionRowBuilder().addComponents(genderMenu);
            const ageRow = new ActionRowBuilder().addComponents(ageMenu);
            const statusRow = new ActionRowBuilder().addComponents(statusMenu);

            // Envoyer les menus de rôles
            await rolesChannel.send({ embeds: [genderEmbed], components: [genderRow] });
            await rolesChannel.send({ embeds: [ageEmbed], components: [ageRow] });
            await rolesChannel.send({ embeds: [statusEmbed], components: [statusRow] });

            await interaction.reply({
                content: '✅ Le système de vérification a été configuré avec succès !',
                ephemeral: true
            });

        } catch (error) {
            console.error('Erreur lors de la configuration:', error);
            await interaction.reply({
                content: '❌ Une erreur est survenue lors de la configuration. Vérifiez les permissions du bot.',
                ephemeral: true
            });
        }
    }
};
