const { Client, Events, GatewayIntentBits, MessageFlags} = require('discord.js');
const { debug } = require('./config.json');
const { getCommands } = require('./deploy-commands')
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { deployCommands } = require('./deploy-commands')



client.commands = [];
let [ globalCommands, guildCommands ] = getCommands()
globalCommands.concat(guildCommands).map(command => {
	client.commands.push(command)
})

client.once(Events.ClientReady, c => {
	console.log("UMEQ Bot is online!")

	//Sets the Activity of the Bot
	//client.user.setPresence("Use /help for a guide on all commands")
	
	if (debug){
		console.log(`Number of Commands Loaded: ${client.commands.length}`)
		//deployCommands()
	}
})


client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		/*
		if (!interaction.guild) {
			interaction.reply({content: "Hey, Dm's don't work for Commands. Sorry!", flags: MessageFlags.Ephemeral })
			return
		}
		*/
		console.log(interaction.client.commands)
		const command = interaction.client.commands.find(command => command.data.getName() === interaction.commandName)

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
	
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	}
});

client.login(process.env.TOKEN);