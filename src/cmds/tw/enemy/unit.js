'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have allyCode linked to discord'}, uInfo, guildId, enemyId, gObj, gLevel = 0, rLevel = 0
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    if(opt.find(x=>x.name == 'option') && opt.find(x=>x.name == 'value')){
      if(opt.find(x=>x.name == 'option').value == 'g') gLevel = +opt.find(x=>x.name == 'value').value
      if(opt.find(x=>x.name == 'option').value == 'r') rLevel = +opt.find(x=>x.name == 'value').value + 2
    }
    const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    if(pObj && pObj.guildId){
      msg2send.content = 'There is no opponent guild registered'
      guildId = pObj.guildId
      const guild = (await mongo.find('twStatus', {_id: pObj.guildId}))[0]
      if(guild && guild.enemy) enemyId = guild.enemy
    }
    if(enemyId){
      msg2send.content = 'Error finding unit **'+unit+'**'
      uInfo = await HP.FindUnit(obj, unit, guildId)
    }
    if(uInfo){
      await HP.ReplyButton(obj, 'Getting info for **'+uInfo.nameKey+'** ...')
      msg2send.content = 'Error getting guild Info'
      gObj = await Client.post('fetchTWGuild', {token: obj.token, id: enemyId, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, relic: 1, currentTier: 1, gp: 1, currentRarity: 1}}})
    }
    if(gObj){
      msg2send.content = 'No one in the guild has **'+uInfo.nameKey+'**'+(rLevel ? ' at **R'+(rLevel - 2)+'** or higher':'')+(gLevel ? ' at **G'+gLevel+'** or higher':'')
      let unitsUnsorted
      if(uInfo.combatType == 1){
        unitsUnsorted = gObj.member.filter(r=>r.rosterUnit.some(u=>u.definitionId.startsWith(uInfo.baseId+':') && u.currentTier >= gLevel && u.relic.currentTier >= rLevel)).map(m=>{
          return Object.assign({}, {
            member: m.name,
            rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).currentRarity,
            gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).gp,
            gear: +m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).currentTier || 0,
            relic: +(m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':') && x.currentTier >= gLevel && x.relic.currentTier >= rLevel).relic.currentTier - 2) || 0
          })
        })
      }else{
        unitsUnsorted = gObj.member.filter(r=>r.rosterUnit.some(u=>u.definitionId.startsWith(uInfo.baseId+':'))).map(m=>{
          return Object.assign({}, {
            member: m.name,
            rarity: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).currentRarity,
            gp: m.rosterUnit.find(x=>x.definitionId.startsWith(uInfo.baseId+':')).gp
          })
        })
      }
      if(unitsUnsorted && unitsUnsorted.length > 0){
        const unitsSorted = sorter([{column: 'gp', order: 'descending'}], unitsUnsorted)
        const unitsObj = {}
        for(let i in unitsSorted){
          if(!unitsObj[unitsSorted[i].rarity]){
            unitsObj[unitsSorted[i].rarity] = {
              rarity: unitsSorted[i].rarity,
              players: []
            }
          }
          if(unitsObj[unitsSorted[i].rarity] && unitsObj[unitsSorted[i].rarity].players) unitsObj[unitsSorted[i].rarity].players.push(unitsSorted[i])
        }
        const arrayUnsorted = Object.values(unitsObj)
        const arraySorted = sorter([{column: 'rarity', order: 'descending'}], arrayUnsorted)
        msg2send.content = null
        msg2send.embeds = []
        const embedMsg = {
          color: 15844367,
          title: gObj.name+' ('+gObj.member.length+')',
          timestamp: new Date(gObj.updated),
          description: uInfo.nameKey+' ('+unitsSorted.length+')'+(+rLevel > 0 && uInfo.combatType == 1 ? ' - Relic >= '+(+rLevel - 2):'')+(+gLevel > 0 && uInfo.combatType == 1 ? ' - Gear >= '+gLevel:''),
          author: {
            icon_url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
          },
          thumbnail:{
            url: "https://swgoh.gg/static/img/assets/"+uInfo.thumbnailName+".png"
          },
          footer:{
            text: 'Data Updated'
          }
        }
        embedMsg.fields = []
        for(let i in arraySorted){
          let count = 0, unitCount = 0
          const tempObj = {
            name: arraySorted[i].rarity+"★ : ",
            value: "```autohotkey\n GP   : "+(uInfo.combatType === 1 ? 'G/R : ':'')+"Player\n"
          }
          for(let p in arraySorted[i].players){
            let gearText = ''
            if(uInfo.combatType === 1) gearText = (arraySorted[i].players[p].relic > 0 ? 'R'+arraySorted[i].players[p].relic.toString().padStart(2, '0'):'G'+arraySorted[i].players[p].gear.toString().padStart(2, '0'))
            tempObj.value += numeral(arraySorted[i].players[p].gp/1000).format("0.0").padStart(4, ' ')+"K : "+(uInfo.combatType === 1 ? gearText+' : ':'')+(await HP.TruncateString(arraySorted[i].players[p].member, 13))+"\n"
            count++
            unitCount++
            if((+p + 1) == arraySorted[i].players.length && count < 25) count = 25
            if(count == 25){
              tempObj.value += '```'
              tempObj.name += '('+unitCount+')'
              embedMsg.fields.push(tempObj)
              if(msg2send.embeds.length < 11) msg2send.embeds.push(JSON.parse(JSON.stringify(embedMsg)))
              embedMsg.fields = []
              tempObj.name = arraySorted[i].rarity+"★ : "
              tempObj.value = "```autohotkey\n GP   : "+(uInfo.combatType === 1 ? 'G/R : ':'')+"Player\n"
              count = 0,
              unitCount = 0
            }
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
