const { adminID } = require('../config.json')


/**
 * Determines whether a interaction user is an admin
 * @param interaction the interaction executed by the user
 * @return if the user is an admin
 */
function isAdmin(interaction){
    // Get the user
    let member = interaction.guild.members.cache.get(interaction.user.id)
    var isAdmin = false
    // Find if the user has an admin role
    member.roles.cache.map(role => {
        if (adminID.includes(role.id)){
            isAdmin = true
            return
        }
    })
    return isAdmin
}

module.exports = {
    isAdmin
}