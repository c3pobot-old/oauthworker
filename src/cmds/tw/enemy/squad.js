'use strict'
const { CheckGuildSquad, GetSquad } = HP.Squads
module.exports = async(obj, opt = [])=>{
  try{
    let squadName, msg2send = {content: 'You do not have allyCode linked to discordId'}, guildId, enemyId, gObj, squad
    if(opt.find(x=>x.name == 'name')) squadName = opt.find(x=>x.name == 'name').value.trim().toLowerCase()
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'There is no opponent guild registered'
      guildId = pObj.guildId
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'Error Getting opponent guild data'
      gObj = await Client.post('fetchTWGuild', {token: obj.token, id: enemyId, joined: []}, null, null)
    }
    if(gObj && gObj.member){
      msg2send.content = 'could not find squad **'+squadName+'**'
      squad = await GetSquad(obj, opt, squadName)
    }
    if(squad && squad.units && squad.units.length > 0){
      msg2send.content = 'Error Calcuting stats'
      const units = await CheckGuildSquad(squad.units, gObj.member)
      if(units){
        const embedMsg = {
          color: 15844367,
          description: 'Guild '+gObj.name+' Squad',
          fields: []
        }
        const tempSquad = {
          name: '**'+squad.nameKey+'**',
          value: '```\n'
        }
        for(let i in squad.units) tempSquad.value += squad.units[i].nameKey+'\n'
        tempSquad.value += '```'
        embedMsg.fields.push(tempSquad)
        const tempObj = {
          name: 'Members ('+units.length+')',
          value: '```\n'
        }
        if(units.length > 0){
          for(let i in units) tempObj.value += units[i]+'\n'
        }else{
          tempObj.value += 'No one meets the squad requirements\n'
        }
        tempObj.value += '```'
        embedMsg.fields.push(tempObj)
        msg2send.content = null
        msg2send.embeds = [embedMsg]
      }
    }
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
