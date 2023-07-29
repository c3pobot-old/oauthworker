'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have discordId linked to allyCode'}, enemyId, guild, gObj
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'You do not have an opponent guild registered'
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'error getting opponent guild info'
      gObj = await Client.post('fetchTWGuild', { token: obj.token, id: enemyId, projection: {playerId: 1, name: 1, quality: 1}})
    }
    if(gObj && gObj.member && gObj.member.length > 0){
      const unsortedArray = []
      const guildTotal = {
        mods: 0,
        gear: 0,
        total: 0,
        top: 0
      }
      for(let i in gObj.member){
        if(gObj.member[i].quality){
          const tempObj = gObj.member[i].quality
          tempObj.name = gObj.member[i].name
          tempObj.total = tempObj.mods + tempObj.gear
          guildTotal.mods += (gObj.member[i].quality.mods || 0)
          guildTotal.gear += (gObj.member[i].quality.gear || 0)
          guildTotal.total += (tempObj.mods + tempObj.gear || 0)
          guildTotal.top += (gObj.member[i].quality.top || 0)
          unsortedArray.push(tempObj)
        }
      }
      const sortedArray = sorter([{column: 'mods', order: 'descending'}], unsortedArray)
      if(sortedArray.length > 0){
        msg2send.content = null
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          timestamp: new Date(gObj.updated),
          description: '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
        }
        embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
        let x = 0, count = 0
        for(let m in sortedArray){
          if(x == 0 && count == 0){
            embedMsg.title = gObj.name+' Roster Quality ('+gObj.member.length+')';
          }
          const modQuality = numeral(sortedArray[m].mods).format('0.00')
          const gearQuality = numeral(sortedArray[m].gear).format('0.00')
          const totalQuality = numeral(sortedArray[m].total).format('0.00')
          const top80Quality = numeral(sortedArray[m].top).format('0.00')
          embedMsg.description += (modQuality.length > 4 ? modQuality.substring(0,4):modQuality)+' : '+(gearQuality.length > 4 ? gearQuality.substring(0,4):gearQuality)+' : '+(totalQuality.length > 4 ? totalQuality.substring(0,4):totalQuality)+' : '+(top80Quality.length > 4 ? top80Quality.substring(0,4):top80Quality)+' : '+(sortedArray[m].name.length > 10 ? sortedArray[m].name.substring(0, 10):sortedArray[m].name)+'\n'
          count++
          if(((+m + 1) == +sortedArray.length) && count < 25) count = 25
          if(count == 25){
            x++;
            count = 0
            embedMsg.description += '```'
            msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
            embedMsg.title = null
            embedMsg.description = '```autohotkey\n'+' Mod : Gear : Tot  : Top 80 Mod : Name\n'
            embedMsg.description += numeral(guildTotal.mods / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.gear / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.total / +gObj.member.length).format('0.00')+' : '+numeral(guildTotal.top / +gObj.member.length).format('0.00')+' : Guild Average\n'
          }
        }
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
