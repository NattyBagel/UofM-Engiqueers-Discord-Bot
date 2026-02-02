const fs = require('fs')


function getJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (e) {
        console.log(e)
    }
}

function saveJson(filePath, data) {
    try {
        const jsonData = JSON.stringify(data, null, 4)
        fs.writeFileSync(filePath, jsonData)
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    getJson,
    saveJson
}