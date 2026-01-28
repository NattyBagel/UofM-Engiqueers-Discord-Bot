const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ModalBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , TextInputBuilder , TextInputStyle , LabelBuilder , TextDisplayBuilder } = require('discord.js');
const { getJson , capitalizeName } = require('../../functions/text')
const { numWarnsBeforeBan } = require('../../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warns a user')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild)
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
    execute,
    help: {
		guideText: 'Gives or Removes a Strike',
		priority: -1
	}
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
 * SPECIAL CASES
 * - Make sure Execs & admins arn't warned, so they can't ban each other
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

async function createWarning(interaction){
    const modal = createWarningModal(interaction)
    await interaction.showModal(modal)
}

async function deleteWarning(interaction){

}




function createWarningModal(interaction){
    let targetName = capitalizeName(interaction.options.getUser('target').username)

    let selectMenu = new StringSelectMenuBuilder()
    .setCustomId("rulenum")
    .setPlaceholder("Rule Violated...")
    let i = 1;
    getJson('archives/messages/rules.json').rules.forEach(rule => {
        let option = new StringSelectMenuOptionBuilder()
        .setLabel(`Rule ${i}`)
        .setValue(`${i}`)
        if (rule.length > 96){
            option.setDescription(rule.substring(0,95)+"...")
        }else{
            option.setDescription(rule)
        }
        selectMenu.addOptions(option)
        i++
    })
    let selectMenuLabel = new LabelBuilder()
    .setLabel("Select Which Rule was Violated")
    .setDescription("The user will be messaged on which rule they violated")
    .setStringSelectMenuComponent(selectMenu)

    // Text Box for Extra information
    let textInput = new TextInputBuilder()
    .setCustomId("extrainfo")
    .setPlaceholder(`${targetName} did...`)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    let textInputLabel = new LabelBuilder()
    .setLabel("Extra Information")
    .setDescription("A little bit of extra info, if you're wanting to be specific. (Optional)")
    .setTextInputComponent(textInput)

    let warningText = new TextDisplayBuilder()
    if (0 < numWarnsBeforeBan){ // 0 is a temp value, gotta swap that with something tommorow
        warningText.setContent(`${targetName} has ${numWarnsBeforeBan-0} Warnings Left.`)
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