const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ModalBuilder , StringSelectMenuBuilder , StringSelectMenuOptionBuilder , TextInputBuilder , TextInputStyle , TextDisplayBuilder , ActionRowBuilder} = require('discord.js');
const { getJson } = require('../../functions/text')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Warns a user')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => 
            option
            .setName('warntype')
            .setDescription("Whether to create or delete a warning")
            .setRequired(true)
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
 */

async function execute(interaction){
    switch(interaction.options.getString('warntype')){
        case("new"):
            createWarning(interaction)
            break;
        case("delete"):
            deleteWarning(interaction)
            break;
    }
}

async function createWarning(interaction){
    const modal = createWarningModal()
    console.log(modal)
    console.log("END MODAL -----------")
    await interaction.showModal(modal)
}

async function deleteWarning(interaction){

}




function createWarningModal(){
    
    let selectMenu = new StringSelectMenuBuilder()
    .setCustomId("rulenum")
    .setPlaceholder("Pick a Rule")
    
    let i = 1;
    getJson('archives/messages/rules.json').rules.forEach(rule => {
        selectMenu.addOptions( new StringSelectMenuOptionBuilder()
            .setLabel(`Rule ${i}`)
            .setDescription(rule.substring(0,95)+"...")
            .setValue(`${i}`)
        )
        i++
    })
    

    // Text Box for Extra information
    let textInput = new TextInputBuilder()
    .setCustomId("extrainfo")
    .setPlaceholder("Extra information... (optional)")
    .setStyle(TextInputStyle.Paragraph)
    .setLabel("Any Extra Important Information?")

    let firstRow = new ActionRowBuilder().setComponents(selectMenu)
    let secondRow = new ActionRowBuilder().setComponents(textInput)

    // Building the actual modal
    let modal = new ModalBuilder()
    .setCustomId("createWarning")
    .setTitle("Create Warning")
    .addComponents(firstRow,secondRow)

    return modal
}