'use strict'
const json2xls = require('json2xls');
const fs = require('fs')
const CACHE_DIR = '/home/node/app/cache'
const MapPlatoons = async(data = {}, platoons = {}, maxRelic = 9)=>{
  try{
    if(data?.squads?.length > 0){
      for(let i in data.squads){
        if(data.squads[i].units?.filter(x=>maxRelic >= x.unitRelicTier).length > 0){
          if(!platoons[data.id]) platoons[data.id] = {units:{}, phase: data.phase, type: data.type}
          await MapUnits(data.squads[i].units, platoons, data.id, data.phase, data.type)
        }
      }
    }
  }catch(e){
    console.error(e);
  }
}
const MapUnits = async(units = [], platoons = {}, pId, phase, type)=>{
  try{
    for(let i in units){
      if(!platoons[pId]?.units[units[i].baseId]) platoons[pId].units[units[i].baseId] = {phase: phase, type: type, combatType: (units[i].combatType == 1 ? 'CHAR':'SHIP'), baseId: units[i].baseId, rarity: units[i].rarity, relic: (units[i].unitRelicTier - 2), unit: units[i].nameKey, count: 0,}
      if(!platoons[pId]?.relicTier) platoons[pId].relicTier = units[i].unitRelicTier
      if(platoons[pId]?.units[units[i].baseId]?.count >= 0) platoons[pId].units[units[i].baseId].count++
    }
  }catch(e){
    console.error(e);
  }
}
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting data'}, platoonDef, platoons, excelPlats, excelUnits, platObj = [], guildId, clearContent = true, gObj, rosterUnits = []
    let tbId = await HP.GetOptValue(opt, 'tb-name', 't05D')
    let maxRelic = await HP.GetOptValue(opt, 'relic', 9)
    if(+maxRelic > 9) maxRelic = 9
    maxRelic = +maxRelic + 2
    let includeRoster = await HP.GetOptValue(opt, 'roster', true)
    if(includeRoster){
      clearContent = false
      msg2send.content = 'your discord Id is not linked to allyCode'
      const allyObj = await HP.GetPlayerAC(obj, opt)
      if(allyObj?.mentionError) msg2send.content = 'that user does not have allyCode linked to discordId'
      const pObj = await HP.GetGuildId({}, {allyCode: allyObj?.allyCode}, [])
      if(pObj?.guildId){
        clearContent = true
        guildId = pObj.guildId
      }
    }
    if(guildId){
      clearContent = false
      msg2send.content = 'error getting guild data'
      gObj = await Client.post('fetchGuild', {token: obj.token, id: guildId, projection: { playerId: 1, name: 1, rosterUnit: { definitionId: 1, currentRarity: 1, relic: 1, gp: 1} }}, null)
    }
    if(gObj?.member?.length > 0){
      clearContent = true
      for(let i in gObj?.member){
        let units = gObj.member[i].rosterUnit?.map(x=>{
          return Object.assign({
            player: gObj.member[i].name,
            baseId: x.definitionId?.split(':')[0],
            rarity: +(x.currentRarity || 0),
            relic: +(x.relic?.currentTier ? +x.relic.currentTier - 2:0),
            gp: +(x.gp || 0)
          })
        })
        if(units?.length > 0) rosterUnits = rosterUnits.concat(units)
      }
    }
    if(tbId){
      msg2send.content = 'Error finding platoons for '+tbId
      platoonDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
    }
    if(platoonDef?.platoons?.length > 0){
      msg2send.content = 'Error mapping platoons'
      platoons = {}
      for(let i in platoonDef.platoons) await MapPlatoons(platoonDef.platoons[i], platoons, maxRelic)
      platoons = Object.values(platoons)
      if(platoons?.length > 0){
        for(let i in platoons){
          platObj = platObj.concat(Object.values(platoons[i].units))
        }
      }
    }
    if(rosterUnits?.length > 0){
      let tempObj = await json2xls(rosterUnits, {fields: {
        player: 'string',
        baseId: 'string',
        rarity: 'number',
        relic: 'number',
        gp: 'number'
      }})
      if(tempObj) excelUnits = Buffer.from(tempObj, 'binary')
    }
    if(platObj?.length > 0){
      platObj = await sorter([{column: 'phase', order: 'descending'}], platObj)
      msg2send.content = 'Error mapping excel data'
      let tempObj = await json2xls(platObj, {fields: {
        phase: 'string',
        type: 'string',
        combatType: 'string',
        relic: 'number',
        baseId: 'baseId',
        unit: 'string',
        count: 'number'
      }})
      if(tempObj) excelPlats = Buffer.from(tempObj, 'binary')

    }
    if(excelPlats){
      if(clearContent) msg2send.content = null
      if(clearContent && includeRoster && !excelUnits) msg2send.content = 'Error getting guild roster'
      msg2send.files = []
      msg2send.files.push({file: excelPlats, fileName: tbId+'-platoons.xlsx'})
      if(excelUnits) msg2send.files.push({file: excelUnits, fileName: 'rosterUnits.xlsx'})
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
