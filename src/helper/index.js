global.Jobs = {}
const discordhelper = require('discordhelper')
const swgohhelper = require('swgohhelper')
const Cmds = {...discordhelper,...swgohhelper}

Cmds.GetImg = require('./getScreenShot')
Cmds.FetchPlayer = require('./fetchPlayer')
Cmds.ReplyTokenError = require('./replyTokenError')
Cmds.GetPlayerAC = require('./getPlayerAC')
module.exports = Cmds
