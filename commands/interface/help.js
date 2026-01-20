const { SlashCommandBuilder, EmbedBuilder, MessageFlags , ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { version , defaultColor } = require('../../config.json')
const { isAdmin } = require('../../functions/roles')

const timeout = 180
const maxCommandsPerPage = 8
var maxPages = -1


function getPage(interaction,currPageNumber){

    let commandList = {} // List of All Available commands (unsorted)
    let commandNum = 0
    let commandsAdded = 0
    // Add each command into a list sorted by priority
    interaction.client.commands.forEach(command => {
        // Ignore Commands that are admin, if user isnt admin
        if (isAdmin(interaction) || command.help.priority != -1){
            // If command priority doesn't exist in list, add it
            if (!commandList.hasOwnProperty(command.help.priority)){
                commandList[command.help.priority] = []
            }
            commandList[command.help.priority].push(command)
            commandNum++; // increase the number of commands
        }
    })
    // Sets the max amount of pages
    maxPages = Math.ceil(commandNum/maxCommandsPerPage)
    // Builds the start of the Embed
    let Embed = new EmbedBuilder()
    .setColor(defaultColor)
    .setTitle(`UMEQ Command Help Guide (Page ${currPageNumber}/${maxPages})`)
    .setDescription(`Need Help with Commands? Here's some information! (Bot v${version})`)
    
    let currPriority = 0
    let currCount = 0
    let complete = false
    if (isAdmin) currPriority = -1
    // O(n) time, can be optimized but its good enough for now
    while(!complete){
        let i = 0
        // Make sure Priority Exists
        if (commandList.hasOwnProperty(currPriority)){
            // Checks within the priority
            while(!complete && i < commandList[currPriority].length){
                if(currCount >= maxCommandsPerPage * (currPageNumber - 1)){
                    Embed.addFields({
                        name: `${commandList[currPriority][i].data.name}`, 
                        value: `${commandList[currPriority][i].help.guideText}`,
                        inline: true
                    })
                    commandsAdded++
                }
                if (commandsAdded >= Math.min(maxCommandsPerPage,commandNum) || currCount >= commandNum) complete = true
                i++
                currCount++
            }
        }
        currPriority++
    }

    return Embed
}


async function sendReply(interaction,currPageNumber,edit,cancel){
    let Embed = getPage(interaction,currPageNumber)

    let backPage = new ButtonBuilder()
        .setCustomId('back')
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)

    let nextPage = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false)

    if (currPageNumber == 1 || cancel){
        backPage.setDisabled(true)
    }
    if (currPageNumber == maxPages || cancel){
        nextPage.setDisabled(true)
    }

    let row = new ActionRowBuilder()
        .addComponents(backPage,nextPage)

    if (!edit){ // Check for initial message send
        return await interaction.reply({ 
            embeds: [Embed], 
            flags: MessageFlags.Ephemeral, 
            components: [row],
            withResponse: true
        });
    }
    else{ // If message has been sent, edit it
        return await interaction.editReply({ 
            embeds: [Embed], 
            flags: MessageFlags.Ephemeral, 
            components: [row],
            withResponse: true
        });
    }

}



async function execute(interaction) {
        
    var exit = false
    var first = true
    var currPageNumber = 1
    const reply = await sendReply(interaction,currPageNumber,false,false)
    const collectorFilter = i => i.user.id === interaction.user.id && i.isButton();

    while (!exit){
        try {
            if (!first) await sendReply(interaction,currPageNumber,true,false)
            else first = false

            const button = await reply.resource.message.awaitMessageComponent({ filter: collectorFilter, time: timeout * 1000 })
            await button.deferUpdate()

            switch (button.customId) {
                case 'back':
                    currPageNumber--
                    break;
                case 'next':
                    currPageNumber++
                    break;
            }
        } catch(e) { // Breaks Collector
            if (e.code == "InteractionCollectorError"){
                exit = true
                sendReply(interaction,currPageNumber,true,true)
            }
            else{
                throw e
            }
        }  
    } 
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Information about Commands'),
	execute,
    help: {
		guideText: 'Sends information about every command.',
		// Priority of Commands (0 is highest for users, -1 is for Admins)
		// If Matched Priority, sort alphabetically
		priority: 0
	}
};
