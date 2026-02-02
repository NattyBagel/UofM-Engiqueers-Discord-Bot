const { EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')
const { version, defaultColor, devGuildID } = require('../../config.json')
const { isAdmin } = require('../../functions/roles')
const { CommandDataBuilder } = require('../../functions/CommandDataBuilder')

const timeout = 180
const maxCommandsPerPage = 8
var maxPages = -1

/**
 * Gets an Embed of the Current Page
 * @param interaction the ineraction
 * @param currPageNumber the current page number
 * @return an Embed of the Current Page
 */
function getPage(interaction, currPageNumber) {

    let commandByPriorities = sortCommandsByPriority(interaction)
    // Sets the max amount of pages
    maxPages = Math.ceil(Object.keys(interaction.client.commands).length / maxCommandsPerPage)

    // Builds the start of the Embed
    let Embed = new EmbedBuilder()
        .setColor(defaultColor)
        .setTitle(`UMEQ Command Help Guide (Page ${currPageNumber}/${maxPages})`)
        .setDescription(`Need Help with Commands? Here's some information! [(Bot v${version})](https://github.com/NattyBagel/UofM-Engiqueers-Discord-Bot 'Open Github')`)

    let currCount = 0
    let complete = false

    let i = 0
    let keys = Object.keys(commandByPriorities).sort()
    while (!complete && i < keys.length) {
        let k = 0
        let adminCommandNum = 0
        let currCommands = commandByPriorities[keys[i]]
        while (!complete
            && currCount + currCommands.length >= maxCommandsPerPage * (currPageNumber - 1) // Count LowerBound
            && currCount < maxCommandsPerPage * currPageNumber // Count UpperBound
            && k < currCommands.length
        ) {
            if (currCount + k - adminCommandNum >= maxCommandsPerPage * (currPageNumber - 1)) {
                adminCommandNum += attemptToAddCommand(Embed, currCommands[k], interaction)
            }
            k++
            // Commands have been added
            if (currCount + k - adminCommandNum >= maxCommandsPerPage * currPageNumber) {
                complete = true
            }
        }
        // Add Length of the Priority to the count
        currCount += commandByPriorities[keys[i]].length
        i++
    }

    return Embed
}

/**
 * Attempts to Add the command to the help embed. However, a few checks must be passed
 * @param Embed The help Embed
 * @param command The Command To Add
 * @param interaction the interaction
 * @return 1 if the command was rejected
 */
function attemptToAddCommand(Embed, command, interaction) {
    if (!command.data.isGlobalCommand() && !(interaction.guild.id == devGuildID)) {
        // Locked in Dev Guild
        return 1
    }
    if (command.data.isAdminCommand() && !isAdmin(interaction)) {
        // Command is locked by admins
        return 1
    }
    Embed.addFields({
        name: `${command.data.getName()}`,
        value: `${command.data.getHelpText()}`,
        inline: true
    })
    return 0
}

/**
 * Sort commands by Priority
 * @param interaction the interaction
 * @return A dictionary of Arrays of Commands
 */
function sortCommandsByPriority(interaction) {
    let commandsByPriorities = {} // List of All Available commands (unsorted)
    // Add each command into a list sorted by priority
    Object.keys(interaction.client.commands).sort().forEach(key => {
        let priority = interaction.client.commands[key].data.getPriority()
        // Ignore Commands that are admin, if user isnt admin
        if (isAdmin(interaction) || priority != -1) {
            // If command priority doesn't exist in list, add it
            if (!commandsByPriorities.hasOwnProperty(priority)) {
                commandsByPriorities[priority] = []
            }
            commandsByPriorities[priority].push(interaction.client.commands[key])
        }
    })
    return commandsByPriorities
}

/**
 * Sends a Reply back to the User
 * @param interaction the interaction
 * @param currPageNumber the current page number
 * @param edit if the reply should be edited
 * @param cancel if the reply should be killed
 * @return The interaction of the new Reply
 */
async function sendReply(interaction, currPageNumber, edit, cancel) {
    let Embed = getPage(interaction, currPageNumber)

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

    if (currPageNumber == 1 || cancel) {
        backPage.setDisabled(true)
    }
    if (currPageNumber == maxPages || cancel) {
        nextPage.setDisabled(true)
    }

    let row = new ActionRowBuilder()
        .addComponents(backPage, nextPage)

    if (!edit) { // Check for initial message send
        return await interaction.reply({
            embeds: [Embed],
            flags: MessageFlags.Ephemeral,
            components: [row],
            withResponse: true
        });
    }
    else { // If message has been sent, edit it
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
    const reply = await sendReply(interaction, currPageNumber, false, false)
    const collectorFilter = i => i.user.id === interaction.user.id && i.isButton();

    while (!exit) {
        try {
            if (!first) await sendReply(interaction, currPageNumber, true, false)
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
        } catch (e) { // Breaks Collector
            if (e.code == "InteractionCollectorError") {
                exit = true
                sendReply(interaction, currPageNumber, true, true)
            }
            else {
                throw e
            }
        }
    }
}


module.exports = {
    data: new CommandDataBuilder()
        .setName('help')
        .setDescription('Information about Commands')
        .setHelpText('Sends information about every command.')
        .setPriority(0)
        .setGlobalCommand(true),
    execute,
};
