const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#2b2d31')
                .setAuthor({
                    name: `Bienvenue sur ${member.guild.name} !`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setDescription(`J'espère que notre serveur te plaira ${member.user} !`)
                .setImage('https://i.imgur.com/HcqTpXY.png')
                .setFooter({ 
                    text: `Tu es notre ${member.guild.memberCount}ème membre !`,
                    iconURL: member.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();

            const generalChannel = member.guild.channels.cache.find(channel => 
                channel.name === 'général' || 
                channel.name === 'general' || 
                channel.id === '1318324469948878939'
            );

            if (!generalChannel) {
                console.error('Salon général non trouvé');
                return;
            }

            await generalChannel.send({ 
                embeds: [welcomeEmbed] 
            });
            
            console.log(`Message de bienvenue envoyé pour ${member.user.tag}`);
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
        }
    },
};
