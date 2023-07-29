'use strict'
const projection = require('./dbProjection')
module.exports = async(obj, opt = [], fromUpdate = false)=>{
  try{
    let msg2send = {content: 'You do not have your allycode linked to discord id'}, joined = [], enemyId, gObj, eObj, guild, charUnits = [], shipUnits = [], glUnits = [], includeUnits = true
    if(opt.find(x=>x.name == 'units')) includeUnits = opt.find(x=>x.name == 'units').value
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'There is no opponent guild registered'
      guild = (await mongo.find('guilds', {_id: pObj.guildId}))[0]
      const twStatus = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(twStatus?.joined) joined = twStatus.joined.map(x=>x.playerId)
      if(twStatus?.enemy) enemyId = twStatus.enemy
      if(guild?.units && guild.units.filter(x=>x.combatType == 1).length > 0) charUnits = await sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 1))
      if(guild?.units && guild.units.filter(x=>x.combatType == 2).length > 0) shipUnits = await sorter([{column: 'nameKey', order: 'ascending'}], guild.units.filter(x=>x.combatType == 2))
    }
    if(enemyId){
      msg2send.content = 'Error getting home guild info'
      await HP.ReplyButton(obj, 'Pulling home guild data ...')
      gObj = await Client.post('fetchTWGuild', {token: obj.token, id: pObj.guildId, projection: projection})
      if(gObj?.member?.length > 0 && joined?.length > 0 && gObj.member.length > joined.length){
        await HP.ReplyButton(obj, 'Recalculationg home guild stats ...')
        gObj.member = gObj.member.filter(x=>joined.includes(x.playerId))
        await HP.CalcGuildStats(gObj, gObj.member)
      }
    }
    if(gObj?.member?.length > 0){
      msg2send.content = 'Error getting away guild info'
      await HP.ReplyButton(obj, 'Pulling away guild data ...')
      eObj = await Client.post('fetchTWGuild', {token: obj.token, id: enemyId, projection: projection})
    }
    if(eObj?.member?.length > 0){
      const tempGL = await HP.GetFaction('galactic_legend', true)
      if(tempGL?.units?.length > 0) glUnits = await sorter([{column: 'nameKey', order: 'ascending'}], tempGL.units)
      msg2send.content = null
      msg2send.embeds = []
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        title: 'Guild Report',
        description: '['+gObj.name+'](https://swgoh.gg/g/'+gObj.id+'/) ('+gObj.member.length+') vs ['+eObj.name+'](https://swgoh.gg/g/'+eObj.id+'/) ('+eObj.member.length+')',
        fields: [],
        footer: {
          text: "Data Updated"
        }
      }
      await HP.ReplyButton(obj, 'Starting the report creation...')
      const repotGP = await HP.GuildReport.GP(gObj, eObj)
      const overView = await HP.GuildReport.Overview(glUnits, gObj, eObj)
      const twRecord = await HP.GuildReport.TWRecord(gObj.recentTerritoryWarResult, eObj.recentTerritoryWarResult)
      if(repotGP?.name) embedMsg.fields.push(repotGP)
      if(overView?.name) embedMsg.fields.push(overView)
      if(twRecord?.name) embedMsg.fields.push(twRecord)
      msg2send.embeds.push(embedMsg)
      if(includeUnits){
        await HP.ReplyButton(obj, 'Adding units to the report ...')
        if(glUnits.length > 0){
          const glMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: 'TW Galactic Legend units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          await HP.ReplyButton(obj, 'Adding GL units to the report ...')
          for(let i in glUnits){
            const uInfo = glUnits[i]
            if(uInfo){
              const tempUnit = await HP.GuildReport.Unit(uInfo, gObj.member, eObj.member)
              if(tempUnit){
                glMsg.fields.push(tempUnit)
                count++;
              }
            }
            if((+i + 1) == glUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10 && glMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(glMsg)))
              glMsg.fields = []
              count = 0
            }
          }
        }
        await HP.ReplyButton(obj, 'Adding character units to the report ...')
        if(charUnits.length > 0){
          const charMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: 'TW Char units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          for(let i in charUnits){
            if(glUnits.filter(x=>x.baseId == charUnits[i].baseId).length == 0){
              const uInfo = await HP.GetUnit(charUnits[i].baseId, false, false)
              if(uInfo){
                const tempUnit = await HP.GuildReport.Unit(uInfo, gObj.member, eObj.member)
                if(tempUnit){
                  charMsg.fields.push(tempUnit)
                  count++;
                }
              }
            }
            if((+i + 1) == charUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10 && charMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(charMsg)))
              charMsg.fields = []
              count = 0
            }
          }
        }
        await HP.ReplyButton(obj, 'Adding ship units to the report ...')
        if(shipUnits.length > 0){
          const shipMsg = {
            color: 15844367,
            timestamp: new Date(gObj.updated),
            title: 'TW Ship units',
            fields: [],
            footer: {
              text: "Data Updated"
            }
          }
          let count = 0
          for(let i in shipUnits){
            if(glUnits.filter(x=>x.baseId == shipUnits[i].baseId).length == 0){
              const uInfo = await HP.GetUnit(shipUnits[i].baseId, false, false)
              if(uInfo){
                const tempUnit = await HP.GuildReport.Unit(uInfo, gObj.member, eObj.member)
                if(tempUnit){
                  shipMsg.fields.push(tempUnit)
                  count++;
                }
              }
            }
            if((+i + 1) == shipUnits.length && count < 20) count = 20
            if(count == 20){
              if(msg2send.embeds.length < 10 && shipMsg.fields.length > 0) msg2send.embeds.push(JSON.parse(JSON.stringify(shipMsg)))
              shipMsg.fields = []
              count = 0
            }
          }
        }
      }
    }
    if(msg2send.content) msg2send.content += '\nNote: Your opponent guild was successfully added so you can just re-run the `/tw report` to try to get the details'
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
