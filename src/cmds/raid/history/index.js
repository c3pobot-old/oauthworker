'use strict'
const GetMemberPrevious = require('../getMemberPrevious')
const getMember = require('../getMember')
const GetHTML = require('webimg').raid
const getGuild = async(guildId)=>{
  try{
    let guild = (await mongo.find('guildCache', {_id: guildId}, { recentRaidResult: 1, gp: 1, name: 1, member: { playerId: 1, playerName: 1}}))[0]
    if(!guild){
      guild = await Client.post('guild', { guildId: guildId, includeRecentGuildActivityInfo: true} )
      if(guild.guild){
        guild = guild.guild
        guild.name = guild.profile?.name
        guild.gp = guild.profile?.guildGalacticPower
      }
    }
    return guild
  }catch(e){
    console.error(e);
  }
}
module.exports = async(obj = {}, opt=[])=>{
  try{
    let msg2send = { content: 'you do not have discord linked to allycode' }, allyCode, guildId, gObj, raids, raidDef, raidData, previousScores, raidHTML, raidImg
    let raidId = await HP.GetOptValue(opt, 'raid')
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj && allyObj.allyCode) allyCode = allyObj.allyCode
    if(allyObj && allyObj.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
    if(allyCode){
      msg2send.content = 'Player is not in a guild'
      const pObj = await HP.GetGuildId({dId: null}, {allyCode: allyCode}, opt)
      if(pObj?.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'Error getting guild info'
      gObj = await getGuild(guildId)
    }
    if(gObj.recentRaidResult){
      msg2send.content = 'there is no raid history for '+gObj?.name
      raids = await sorter([{column: 'endTime', order: 'descending'}], gObj.recentRaidResult)
    }
    if(raids?.length > 0){
      msg2send.content = 'Error getting raid definition'
      if(!raidId) raidId = raids[0].raidId
      if(raidId) raidDef = (await mongo.find('raidDef', {_id: raidId}))[0]
    }
    if(raidDef?.nameKey){
      msg2send.content = 'Error getting previous scores'
      previousScores = await GetMemberPrevious(raids, raidId)
    }
    if(previousScores && Object.values(previousScores)?.length > 0){
      msg2send.content = 'error calculating data'
      raidData = {name: gObj.name, gp: gObj.gp, nameKey: raidDef.nameKey, leaderBoard: [] }
      for(let i in gObj.member){
        let tempObj = {playerId: gObj.member[i].playerId, low: 0, high: 0, scores: [], avg: 0}
        if(previousScores[gObj.member[i].playerId]) tempObj = previousScores[gObj.member[i].playerId]
        raidData.leaderBoard.push({...gObj.member[i],...tempObj})
      }
      if(raidData.leaderBoard?.length > 0){
        raidData.leaderBoard = await sorter([{column: 'avg', order: 'descending'}], raidData.leaderBoard)
        if(previousScores.guildTotal){
          raidData.leaderBoard.unshift(previousScores.guildTotal)
          raidData.date = 0
          for(let i in previousScores.guildTotal.dates){
            if(+previousScores.guildTotal.dates[i] > raidData.date) raidData.date = +previousScores.guildTotal.dates[i]
          }
        }
      }
    }
    if(raidData?.leaderBoard?.length > 0){
      msg2send.content = 'Error getting html'
      raidHTML = await GetHTML.history(raidData)
    }
    if(raidHTML){
      msg2send.content = 'error getting image'
      raidImg = await HP.GetImg(raidHTML, obj.id, 100, false)
    }
    if(raidImg){
      msg2send.content = null
      msg2send.file = raidImg
      msg2send.fileName = gObj?.name+'-'+raidId+'-raid.png'
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
