const { MessageFlags } = require('discord.js');
const { CommandDataBuilder } = require('../../functions/CommandDataBuilder')

module.exports = {
	data: new CommandDataBuilder()
		.setName('ping')
		.setDescription('Sends Pong to the User')
		.setAdminCommand()
		.setHelpText('A test command. Returns "Pong!"')
		.setPriority(2),
	async execute(interaction) {
		await interaction.reply({ content: 'Pong!', flags: MessageFlags.Ephemeral })
	},
}
