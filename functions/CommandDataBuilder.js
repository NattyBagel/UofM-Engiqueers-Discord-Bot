const { SlashCommandBuilder , PermissionFlagsBits , InteractionContextType } = require('discord.js')


/**
 * Holds and manages data about commands
 */
class CommandDataBuilder {
    
    constructor(){
        this.name = null
        this.description = null
        this.slashCommand = new SlashCommandBuilder() // Slash command Object
        this.helpText = null // The text shown in the /help command
        this.priority = 0 // The priority of the ordering of the /help command
        this.admin = false // Command is For Admins only
        this.globalCommand = false // Command is for All or Specific Servers
    }

    toString(){
        return "lol"
    }

    /**
     * Checks if the command is Valid
     * @return true if valid
     */
    isValidCommand(){
        return this.getValidityProblems().length == 0
    }

    /**
     * Gets a String Representation of all the problems with the command
     * @return A list of Problems
     */
    getValidityProblems(){
        let problems = []
        if (this.name == null) problems.push(' Name is Missing')
        if (this.description == null) problems.push(' Description is Missing')
        if (this.helpText == null) problems.push(' HelpText is Missing')
        return problems
    }

    /**
     * Sets the Name of the Command
     * @param name the name of the command
     */
    setName(name){
        this.name = name
        this.slashCommand.setName(name)
        return this
    }

    /**
     * Sets the Name of the Command
     * @return the name of the command
     */
    getName(){
        return this.name
    }

    /**
     * Sets the Description of the Command
     * @param description the desctiption of the command
     */
    setDescription(description){
        this.description = description
        this.slashCommand.setDescription(description)
        return this
    }

    /**
     * Gets the Slash Command Object
     * @return the Slash Command Object (SlashCommandBuilder())
     */
    getSlashCommandObject(){
        return this.slashCommand
    }

    /**
     * Sets the /help text of the Command
     * @param text the /help text of the command
     */
    setHelpText(text){
        this.helpText = text
        return this
    }

    /**
     * Gets the /help text of the command
     * @returns the /help text of the command
     */
    getHelpText(){
        return this.helpText
    }

    /**
     * Sets the Priority of the command
     * @param priorityNum the priority of the command
     */
    setPriority(priorityNum){
        this.priority = priorityNum
        return this
    }

    /**
     * Gets the Priority of the Command
     * @returns the priority of the command
     */
    getPriority(){
        return this.priority
    }

    /**
     * Sets the command to Admins only
     */
    setAdminCommand(){
        this.admin = true
        this.slashCommand
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setContexts(InteractionContextType.Guild)
        return this
    }

    /**
     * Get the Command to be for Admins Only
     */
    isAdminCommand(){
        return this.admin
    }  

    /**
     * Sets the command to be in all servers
     */
    setGlobalCommand(){
        this.globalCommand = true
        return this
    }

    /**
     * Is this command enabled in all servers
     */
    isGlobalCommand(){
        return this.globalCommand
    }
    
    addStringOption(options){
        this.slashCommand.addStringOption(options)
        return this
    }
    addUserOption(options){
        this.slashCommand.addUserOption(options)
        return this
    }
}

module.exports = {
    CommandDataBuilder
}