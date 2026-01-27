const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags} = require('discord.js');
const { getJson } = require('../../functions/text')



async function execute(interaction){
    
    const channel = await interaction.client.channels.cache.get("1436499982113837158")
    const data = getJson('archives/messages/rules.json')

    let getRules = function(){
        let str = ""
        let i = 1
        data.rules.forEach(rule => {
            str += `### Rule ${i}\n${rule}\n`
            i++
        })
        return str
    }

    channel.send({ // Message Components my beloved
        "flags": 32768,
        "components": [{
            "type": 17,
            "accent_color": 15151829,
            "spoiler": false,
            "components": [{
                    "type": 10,
                    "content": data.title + "\n" + data.description
                },
                {
                    "type": 14,
                    "spacing": 1,
                    "divider": true
                },
                {
                    "type": 10,
                    "content": getRules()
                }
            ]
        }],
    })
    await interaction.reply({content:'Rules have Been Sent!',flags: MessageFlags.Ephemeral})

}





module.exports = {
	data: new SlashCommandBuilder()
		.setName('sendrules')
		.setDescription('Sends Rules of the Server')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild),
	execute,
    help: {
		guideText: 'Sends the Rules of the Server',
		// Priority of Commands (0 is highest for users, -1 is for Admins)
		// If Matched Priority, sort alphabetically
		priority: -1
	}
};
