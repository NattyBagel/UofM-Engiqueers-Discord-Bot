const { SlashCommandBuilder , EmbedBuilder , MessageFlags } = require('discord.js');
const fs = require('fs')
const { removeExtensions, convertToID , shortenLink } = require('../../functions/text.js')
const path = require('node:path')

const resourcePath = 'archives/resources'
/**
 * Class To Manage Resources Available 
 */
class Resource {

	constructor(resource){
		this.name = resource.name
		this.link = resource.link
		this.description = resource.description
	}

	/**
	 * Loads all Resources from Files
	 * @param dirPath path of the folder containing the resources
	 * @return all resources
	 */
	static load(){
		let allResourceGroups = {}
		// Go through each file in the folder
		try{
			fs.readdirSync(resourcePath).filter(file => file.endsWith('.json')).forEach(fileName => {
				// Parse the info in the file
				const data = fs.readFileSync(path.join('.',resourcePath,fileName),'utf-8')	
				JSON.parse(data).forEach(resource => {
					// Check for new key for each resource group
					let key = convertToID(removeExtensions(fileName))
					if (!(key in allResourceGroups)){
						// Create a new Resource group, to contain the smaller resources
						allResourceGroups[key] = new ResourceGroup(removeExtensions(fileName),resource.maindescription,resource.colour)
					}else{
						// Add Resource into its designated resource group
						allResourceGroups[key].push(new Resource(resource))
					}					
				})			
			})
		}catch(error){
			console.log(error)
		}
		
		return allResourceGroups
	}
}

class ResourceGroup {
	
	constructor(name,description,colour){
		this.name = name
		this.description = description
		this.resources = []
		this.colour = colour
	}

	/**
	 * Adds a resource to the resource group
	 * 
	 * @param resource the resource to add to the group
	 */
	push(resource){
		this.resources.push(resource)
	}
}

const allResourceGroups = Resource.load();
var data = new SlashCommandBuilder()
	.setName('resources')
	.setDescription('Check Resources for a wide range of topics. All Private!')
	.addStringOption(option => 
		option
		.setName('topic')
		.setDescription("The topic to view")
		.setRequired(true)
	)
Object.keys(allResourceGroups).forEach(key => { // Add a selector option for each resource group
	let choice = {}
	choice['name'] = allResourceGroups[key].name
	choice['value'] = key
	data.options[0].addChoices(choice)
})

function findResourceGroup(interaction){
	return allResourceGroups[interaction.options.getString('topic')]
}

async function execute(interaction) {
	const resourceGroup = findResourceGroup(interaction)
	if (resourceGroup != null){
		let Embed = new EmbedBuilder()
		.setTitle(resourceGroup.name)
		.setDescription(resourceGroup.description)
		.setColor(resourceGroup.colour)
		resourceGroup.resources.forEach(resource => {
			let field = {}
			field['name'] = resource.name
			field['value'] = `[${shortenLink(resource.link)}](${resource.link})\n${resource.description}`
			field['inline'] = true
			Embed.addFields(field)
		})
		await interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral })
	}else{
		await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral })
	}
	
}

module.exports = {
	data: data,
	execute
};