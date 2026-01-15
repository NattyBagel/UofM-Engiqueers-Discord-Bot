const { SlashCommandBuilder, EmbedBuilder, MessageFlags , ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { version , defaultColor } = require('../../config.json');

const timeout = 180

var pageNumber = 1
const maxPage = 2
const minPage = 1

function getPage(pageNumber){
    var Embed = new EmbedBuilder()
        .setColor(defaultColor)
        .setTitle('UMEQ Bot Guide (?/?)')
        .addFields(
            {name: 'Version', value: `${version}`},
        );
    switch (pageNumber) {
        case 1:
            Embed = new EmbedBuilder()
                .setColor(defaultColor)
                .setTitle(`UMEQ Bot Guide (1/${maxPage})`)
                .addFields(
                    {name: 'Version', value: `${version}`},
                );
            break;
        case 2:
            Embed = new EmbedBuilder()
                .setColor(defaultColor)
                .setTitle(`UMEQ Bot Guide (2/${maxPage})`)
                .addFields(
                    {name: 'Version', value: `${version}`},
                );
            break;

    }
    return Embed;
}

async function sendReply(interaction,edit,cancel){
    var Embed = getPage(pageNumber)

    const backPage = new ButtonBuilder() // Add Button
        .setCustomId('back')
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)

    const nextPage = new ButtonBuilder() // Add Button
        .setCustomId('next')
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)

    if (pageNumber == minPage || cancel){
        backPage.setDisabled(true)
    }
    if (pageNumber == maxPage || cancel){
        nextPage.setDisabled(true)
    }

    const row = new ActionRowBuilder()
        .addComponents(backPage,nextPage)

    if (!edit){
        return await interaction.reply({ 
            embeds: [Embed], 
            flags: MessageFlags.Ephemeral, 
            components: [row],
            withResponse: true
        });
    }
    else{
        return await interaction.editReply({ 
            embeds: [Embed], 
            flags: MessageFlags.Ephemeral, 
            components: [row],
            withResponse: true
        });
    }

}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Information about Commands'),
	async execute(interaction) {
        
        var exit = false
        var first = true
        const reply = await sendReply(interaction,false,false)
        const collectorFilter = i => i.user.id === interaction.user.id && i.isButton();

        pageNumber = 1

        while (!exit){
            try {
                if (!first) await sendReply(interaction,true,false)
                else first = false

                const button = await reply.resource.message.awaitMessageComponent({ filter: collectorFilter, time: timeout * 1000 })
                await button.deferUpdate()

                switch (button.customId) {
                    case 'back':
                        pageNumber--
                        break;
                    case 'next':
                        pageNumber++
                        break;
                }
            } catch(e) { // Breaks Collector
                if (e.code == "InteractionCollectorError"){
                    exit = true
                    sendReply(interaction,true,true)
                }
                else{
                    throw e
                }
            }  
        } 
	},
};
