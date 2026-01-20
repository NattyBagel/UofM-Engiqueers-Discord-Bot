const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, ActivityType} = require('discord.js');
const { debug } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
//const { deployCommands } = require('./deploy-commands')



client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command && 'help' in command) {
			client.commands.set(command.data.name, command);
			//console.log(command)
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data", "execute" or "help" property.`);
		}
	}
}

client.once(Events.ClientReady, c => {
	console.log("Bot is on!")
	//Sets the Activity of the Bot
	   client.user.setPresence({
	   activities: [{ 
		  name: `NattyBagel's Bot`, 
		  type: ActivityType.Watching , 
		  url: 'https://www.twitch.tv/nattybagel'}],
	});
	
	if (debug){
		console.log(`Number of Commands Loaded: ${client.commands.size}`);
		//deployCommands()
	}
});


client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		/*
		if (!interaction.guild) {
			interaction.reply({content: "Hey, Dm's don't work for Commands. Sorry!", flags: MessageFlags.Ephemeral })
			return
		}
		*/
		const command = interaction.client.commands.get(interaction.commandName);

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