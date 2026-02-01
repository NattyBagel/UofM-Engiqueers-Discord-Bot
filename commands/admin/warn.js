const { ModalBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , TextInputBuilder , 
        TextInputStyle , LabelBuilder , TextDisplayBuilder , MessageFlags , EmbedBuilder} = require('discord.js');
const { capitalizeName } = require('../../functions/text')
const { getJson , saveJson } = require('../../functions/files')
const { modalCollector } = require('../../functions/collectors')
const { numWarnsBeforeBan } = require('../../config.json')
const { debug , ticketChannelID , warningImmunityRoleIDs } = require('../../config.json')
const { CommandDataBuilder } = require('../../functions/CommandDataBuilder')

const warningFilePath = 'archives/users/warnings.json'

module.exports = {

    data: new CommandDataBuilder()
    .setName('warn')
    .setDescription('Warns a user')
    .setHelpText('Gives or Removes a Strike')
    .setPriority(1)
    .setAdminCommand()
    .setGlobalCommand()
    .addUserOption(option => option
        .setName('target')
        .setRequired(true)
        .setDescription('Give or take a Warning from...')
    )
    .addStringOption(option => option
        .setName('warntype')
        .setDescription("Whether to create or delete a warning")
        .addChoices(
            {name:"New",value:"new"},
            {name:"Delete",value:"delete"}
        )
    ),
	execute
};

/**
 * Warn System
 * - Create
 *      Modal
 *          Select Menu - Select which rule was broken
 *          Text Input - Extra Information (optional)
 *          Label warning the number of warnings a user has gotten, and if they're about to be banned
 *      When a Warning is Created, Send a message in tickets that one has been created
 * - Delete
 *      Modal
 *          Select Menu - Select which warning to strike
 *      When a Warning is Deleted, Send a message in tickets that one has been deleted
 * 
 * - GET
 *      Gets previous warnings of the user
 * 
 * SPECIAL CASES
 * - Make sure Execs & admins arn't warned, so they can't ban each other
 */

/**
 * Command Executer
 * @param interaction the interaction of the command
 */
async function execute(interaction){
    let warnType = interaction.options.getString('warntype') ?? 'new'
    switch(warnType){
        case("new"):
            createWarning(interaction)
            break;
        case("delete"):
            deleteWarning(interaction)
            break;
    }
}

/**
 * Gives a User a Warning
 * @param interaction the interaction of the command
 */
async function createWarning(interaction){
    const target = interaction.options.getUser('target')
    const targetMember = interaction.options.getMember('target')
    let adminRoleIDs = targetMember.roles.cache.filter(role => warningImmunityRoleIDs.includes(role.id)).map(role => role.id)
    if (adminRoleIDs.length > 0){
        // warningImmunityRoleIDs has been detected
        interaction.reply({content: `<@${target.id}> cannot be given a warning because of the role <@&${adminRoleIDs[0]}>`, flags: MessageFlags.Ephemeral})
        return // end createWarning command
    }
    const numWarnings = getNumWarnings(target.id)
    const modal = createWarningModal(target,numWarnings)
    interaction.showModal(modal)
    modalCollector(interaction,300).then((modalInteraction) => {  // Set to 5 mins before timeout
        if (modalInteraction == null){ // Modal Not Recieved
            interaction.followUp({content:'Warning has not been sent', flags: MessageFlags.Ephemeral })
        }else{ // Modal Succesfully recieved
            const ruleViolated = modalInteraction.fields.getStringSelectValues('rulenum')
            const extraInformation = modalInteraction.fields.getTextInputValue('extrainfo')
            // Send a DM to the target
            messageTarget(targetMember, ruleViolated, extraInformation, numWarnings)
            if (numWarnings < numWarnsBeforeBan){
                // Warn Target
                if (debug) console.log(`${target.username} has been Warned`)
                saveWarning(target,ruleViolated,extraInformation)
                interaction.followUp({content:`<@${target.id}> has been Warned`, flags: MessageFlags.Ephemeral })
            }else{
                // Ban Target
                if (debug) console.log(`${target.username} has been Banned`)
                interaction.followUp({content:`<@${target.id}> has been Banned`, flags: MessageFlags.Ephemeral })
                targetMember.ban({ deleteMessageSeconds: 604800, reason: 'Exceeded Number of Warnings' }) // Ban Target
            }
            // Send a Ticket to the Ticket Channel
            createTicket(target, ruleViolated, extraInformation, numWarnings, interaction)
        }
    })
}

/**
 * Creates a ticket in a ticket channel
 * @param target the target
 * @param ruleViolated which rule was violated
 * @param extraInfo Extra Mod Information
 * @param numWarnings the current number of warnings recieved
 * @param interaction the initial interaction
 */
function createTicket(target, ruleViolated, extraInfo, numWarnings,interaction){
    const ticketChannel = interaction.client.channels.cache.get(ticketChannelID) 
    let Embed = new EmbedBuilder()
    .setColor("97d0fc")
    .setTitle(`Warning Ticket`)
    .setAuthor({name:`${interaction.user.username} created a warning`,iconURL:`https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png`})
    .addFields(
        {name: `Rule ${ruleViolated} Violated`, value: `${extraInfo}`}
    )
    if (numWarnings < numWarnsBeforeBan){
        Embed.setDescription(`${target.username} (<@${target.id}>) has recieved warning #${numWarnings}.`)
    }else{
        Embed.setDescription(`${target.username} (<@${target.id}>) has been banned.`)
    }
    ticketChannel.send({embeds: [Embed]})
}

/**
 * Messages the Target on what happened
 * @param member the member who violated the rules
 * @param ruleViolated which rule was violated
 * @param extraInfo Extra Moderator information
 * @param numWarnings The Current number of warnings recieved
 */
function messageTarget(member, ruleViolated, extraInfo, numWarnings){
    const ruleList = getJson('archives/messages/rules.json').rules
    const ruleDescription = ruleList[ruleViolated-1] // -1 since index
    if (numWarnings < numWarnsBeforeBan){
        // Warn Message
        member.send(`Hi!\nYou just recieved a warning (#${numWarnings}). If you reach ${numWarnsBeforeBan} warnings, you'll be banned from the EQ discord.\n### Violated Rule:\nRule ${ruleViolated}: ${ruleDescription}\n**Reason:** ${extraInfo}\n\nPlease visit the <#1436499982113837158> chat and give the rules another read`)
    }else{
        // Ban Message
        member.send(`Hi!\nYou just recieved your final warning.\n### Violated Rule:\n${ruleViolated}: ${ruleDescription}\n**Reason:** ${extraInfo}\n\nHave a nice day.`)
    }
}


/**
 * Deletes a Warning
 * @param interaction the interaction of the command
 */
async function deleteWarning(interaction){
    interaction.reply({content:'Deleting Warnings has not been implemented yet, sorry!', flags: MessageFlags.Ephemeral })
}

/**
 * Saves a warning to the warning File
 * @param target the Target to warn
 * @param ruleViolated The Rule which was violated
 * @param extraInformation Any Extra Info
 */
function saveWarning(target,ruleViolated,extraInformation){
    const data = getJson(warningFilePath)
    if (!(target.id in data)){
        data[target.id] = []
    }
    const warning = {}
    warning['rV'] = ruleViolated
    warning['eI'] = extraInformation
    data[target.id].push(warning)

    saveJson(warningFilePath,data)
}

/**
 * Gets the number of warnings from a user
 * @param targetId the ID of the target
 * @return the Number of Warnings of the target
 */
function getNumWarnings(targetId){
    const data = getJson(warningFilePath)
    if (targetId in data){
        return data[targetId].length + 1
    }
    return 1
}


// TargetName needs to have a finite limit so it doesn't overflow the labels
/**
 * Creates a Warning Modal for Admins
 * @param target the target
 * @return created modal
 */
function createWarningModal(target,numWarnings){
    let targetName = capitalizeName(target.username)
    // Select Menu of Violated Rules
    let selectMenu = new StringSelectMenuBuilder()
    .setCustomId("rulenum")
    .setPlaceholder("Rule Violated...")
    let i = 1;
    getJson('archives/messages/rules.json').rules.forEach(rule => { // Add Each Rule to Menu
        let option = new StringSelectMenuOptionBuilder()
        .setLabel(`Rule ${i}`)
        .setValue(`${i}`)
        if (rule.length > 96){ // Select Menu's cannot have >100 caracters
            option.setDescription(rule.substring(0,95)+"...")
        }else{
            option.setDescription(rule)
        }
        selectMenu.addOptions(option)
        i++
    })
    let selectMenuLabel = new LabelBuilder()
    .setLabel("Select Which Rule was Violated")
    .setDescription(`${targetName} will be messaged on which rule they violated`)
    .setStringSelectMenuComponent(selectMenu)

    // Text Box for Extra information
    let textInput = new TextInputBuilder()
    .setCustomId("extrainfo")
    .setPlaceholder(`${targetName} did...`)
    .setStyle(TextInputStyle.Paragraph)
    let textInputLabel = new LabelBuilder()
    .setLabel("Extra Details")
    .setDescription(`A little bit of extra info. ${targetName} will be messsaged this.`)
    .setTextInputComponent(textInput)

    // Show how many warnings are left, or if the user is about to be banned
    let warningText = new TextDisplayBuilder()
    if (numWarnings < numWarnsBeforeBan){
        warningText.setContent(`${targetName} has ${numWarnsBeforeBan-numWarnings} Warnings Left.`)
    }else{
        warningText.setContent(`${targetName} will be Banned.`)
    }

    // Building the actual modal
    let modal = new ModalBuilder()
    .setCustomId("createWarning")
    .setTitle("Create Warning")
    .addLabelComponents(selectMenuLabel,textInputLabel)
    .addTextDisplayComponents(warningText)

    return modal
}