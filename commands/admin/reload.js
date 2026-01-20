const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { deployCommands } = require("../../deploy-commands.js");
const { adminColor } = require("../../config.json");

async function reimportCommands(interaction){
    const commandsLoaded = await deployCommands()
    const Embed = new EmbedBuilder()
        .setColor(adminColor)
        .setTitle(`Commands Reimported!`)
        .addFields(
            {name: 'Commands Reloaded', value: `${commandsLoaded[0].length + commandsLoaded[1].length}`}
        );
    
    interaction.reply({ embeds: [Embed], flags: MessageFlags.Ephemeral })
}

async function restart(interaction){
    // Not implemented yet
    interaction.reply({ content: 'not implemented yet', flags: MessageFlags.Ephemeral })
}

async function reDownloadCommands(interaction){ 
    // Not implemented yet
    interaction.reply({ content: 'not implemented yet', flags: MessageFlags.Ephemeral })
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('(BOT ADMIN & DEV) Reloads Commands')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What to Reload')
                .setRequired(true)
                .addChoices(
                    { name: 'All', value: '0' },
                    { name: 'Reimport Commands', value: '1' },
                    { name: 'Restart Bot', value: '2' },
                    { name: 'Download Files', value: '3'}
                )
        ),
	async execute(interaction) {

        switch (interaction.options.getString('type')) {
            case '0': // Reload Both Options
                reimportCommands(interaction);
                reloadCommands(interaction);
                break;
            case '1': // Reimport Commands from deploy-commands.js
                reimportCommands(interaction)
                break;
            case '2': // reload index.js
                restart(interaction)
                break;
            case '3': // Redownload
                reDownloadCommands(interaction)
                break;
            default:
                await interaction.reply({ content: "Error, Something went Wrong", flags: MessageFlags.Ephemeral })
                break;
        }
	},
    help: {
		guideText: 'Reloads key functions of the bot, such as the bot itself, commands and downloading from github',
		// Priority of Commands (0 is highest for users, -1 is for Admins)
		// If Matched Priority, sort alphabetically
		priority: -1
	}
};