const fs  = require('fs')

/**
 * Capitalizes the first letter of each word
 * 
 * @param str uncapitalized string
 * @return capitalized string
 */
function capitalizeName(str){
    var REGEX = /(\b[a-z](?!\s))/g
    return str.replace(REGEX, function(x){
        return x.toUpperCase()
    })
}

/**
 * Removes the Extension of the string
 * 
 * @param str string to remove the extension
 * @return string without the extension
 */
function removeExtensions(str){
    return str.substring(0,str.indexOf(".",-1))
}

/**
 * Takes in a name and converts it into an ID
 * @param str string to covert
 * @return converted string
 */
function convertToID(str){
    return str.replaceAll(" ","_").toLowerCase()
}

/**
 * Shortens the link of a URL to remove the https://
 */
function shortenLink(str){
    if(str.toLowerCase().startsWith("https://")){
        str = str.replace("https://","")
    }else if (str.toLowerCase().startsWith("http://")){
        str = str.replace("http://","")
    }
    if(str.startsWith("www")){
        str = str.replace("www","")
    }
    if(str.includes("/")){
        str = str.substring(0,str.indexOf('/'))
    }
    return str
}


module.exports = {
    capitalizeName,
    removeExtensions,
    convertToID,
    shortenLink
}