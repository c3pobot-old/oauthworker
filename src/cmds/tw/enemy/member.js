'use strict'
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have discordId linked to allyCode'}, enemyId, guild, eObj
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'You do not have an opponent guild registered'
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'error getting opponent guild info'
      eObj = await Client.post('fetchTWGuild', {token: obj.token, id: enemyId, projection: {name: 1, allyCode: 1}})
    }
    if(eObj && eObj.member && eObj.member.length > 0){
      const memberSorted = sorter([{column: 'name', order: 'ascending'}], eObj.member)
      if(memberSorted.length > 0){
        msg2send.content = null
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          timestamp: new Date(eObj.updated),
          description: '```autohotkey\n'
        }
        let x = 0, count = 0
        for(let i in memberSorted){
          if(x == 0 && count == 0){
            embedMsg.title = eObj.name+' Members ('+memberSorted.length+')';
          }
          embedMsg.description += memberSorted[i].allyCode+' : '+memberSorted[i].name+'\n'
          count++
          if(((+i + 1) == +memberSorted.length) && count < 25) count = 25
          if(count == 25){
            x++;
            count = 0
            embedMsg.description += '```'
            msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
            embedMsg.title = null
            embedMsg.description = '```autohotkey\n'
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
