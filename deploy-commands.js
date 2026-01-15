const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { debug , adminGuildId } = require('./config.json');

module.exports = {
    deployCommands
}

function deployCommands() {
    var commands = [];
    var adminCommands = [];
    
    // Grab all the command folders from the commands directory you created earlier
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);
    
    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory you created earlier
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    
        function readFromFolder(commandFiles){
            const commands = [];
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
            return commands;
        }
    
        if (folder != "admin"){
            commands = commands.concat(readFromFolder(commandFiles));
        }else{
            adminCommands = adminCommands.concat(readFromFolder(commandFiles));
        }
    
    }

    if (debug){
        console.log(commands)
        console.log(adminCommands)
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.TOKEN);
    
    // deploy commands
    (async () => {
        try {
            if (debug){
                console.log(`Started refreshing ${commands.length + adminCommands.length} application commands.`);
            }
            // Refresh all commands in the guild with the current set
            const adminData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIEND_ID, adminGuildId),
                { body: adminCommands },
            );
    
            // Refresh all commands in all guilds
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIEND_ID),
                { body: commands },
            );
            
            if (debug){
                console.log(`Successfully reloaded ${data.length} application commands.`);
                console.log(`Successfully reloaded ${adminData.length} admin application commands.`);
            }
        } catch (error) {
            console.error(error);
        }
    })();

    return [commands,adminCommands]
}