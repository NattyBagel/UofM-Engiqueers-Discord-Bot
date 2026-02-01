const { REST, Routes } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const { debug , devGuildID } = require('./config.json')

module.exports = {
    deployCommands,
    getCommands
}

async function deployCommands() {
    let [ globalCommands, guildCommands ] = getCommands()

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(process.env.TOKEN)
    
    // deploy commands
    
    try {
        if (debug){
            console.log(`Started refreshing ${guildCommands.length + globalCommands.length} application commands.`)
        }
        // Refresh all Guild Commands
        const guildData = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIEND_ID, devGuildID),
            { body: arrayToCommandObject(guildCommands) },
        )

        // Refresh all Global Commands
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIEND_ID),
            { body: arrayToCommandObject(globalCommands) },
        )
        
        if (debug){
            console.log(`Successfully reloaded ${globalData.length} global application commands.`)
            console.log(`Successfully reloaded ${guildData.length} guild application commands.`)
        }
    } catch (error) {
        console.error(error)
    }


    return [ globalCommands, guildCommands ]
}

function arrayToCommandObject(array){
    return array.map(command => command.data.getSlashCommandObject().toJSON())
}

function getCommands(){
    let globalCommands = [] 
    let guildCommands = []
    // Grab all the command folders from the commands directory you created earlier
    const foldersPath = path.join(__dirname, 'commands')
    const commandFolders = fs.readdirSync(foldersPath)
    
    for (const folder of commandFolders) {
        // Grab all the command files from the commands directory you created earlier
        const commandsPath = path.join(foldersPath, folder)
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file)
            const command = require(filePath)
            if (command.data.isValidCommand() && 'execute' in command) {
                if (command.data.isGlobalCommand()){
                    // Is Global Command
                    globalCommands.push(command)
                }else{
                    // Is Guild Command
                    guildCommands.push(command)
                }
            } else { 
                // Command Is invalid, so send a warning
                let problems = command.data.getValidityProblems()
                console.log(`[WARNING] The command at ${filePath} is missing the following properties:`)
                if (problems.length == 0){
                    console.log('\tExecute Property is Missing')
                }else{
                    console.log(`\t${problems}`)
                }
            }
        }
    }
    /*
    if (debug){
        console.log("-------------------------------------\nGLOBAL COMMANDS:")
        console.log(globalCommands)
        console.log("-------------------------------------\nGUILD COMMANDS:")
        console.log(guildCommands)
    }
    */
    return [ globalCommands , guildCommands ]
}