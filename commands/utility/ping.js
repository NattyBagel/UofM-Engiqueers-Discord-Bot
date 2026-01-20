const { SlashCommandBuilder , MessageFlags} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Sends Pong to the User'),
	async execute(interaction) {
		await interaction.reply({content: 'Pong!',flags: MessageFlags.Ephemeral})
	},
    help: {
		guideText: 'A test command. Returns "Pong!"',
		// Priority of Commands (0 is highest for users, -1 is for Admins)
		// If Matched Priority, sort alphabetically
		priority: 1
	}
};
