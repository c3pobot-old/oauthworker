'use strict'
const GetHTML = require('webimg').inventory
module.exports = async(obj = {}, opts = [], pObj = {})=>{
  try{
    let msg2send = { content: 'you did not provide the correct information' }, type, uInfo, pUnit, unitGear, relicLevel, gearLevel, neededGear, neededRelicMats, relicRecipe, unitHTML, unitImg
    let unit = await HP.GetOptValue(opts, 'unit')
    if(unit){
      msg2send.content = 'Error finding **'+unit+'**'
      uInfo = await HP.GetUnit(unit.toString().trim(), true, true)
      if(uInfo?.baseId) pUnit = pObj?.inventory?.unit?.find(x=>x.definitionId.startsWith(uInfo.baseId+':'))
      if(uInfo?.combatType == 2){
        msg2send.content = 'Ships don\'t have gear'
        uInfo = null
      }
    }

    if(uInfo?.baseId){
      msg2send.content = 'Error finding gear for **'+uInfo.nameKey+'**'
      unitGear = gameData.unitData[uInfo.baseId]?.gearLvl
      type = await HP.GetOptValue(opts, 'gear')
      let tier = await HP.GetOptValue(opts, 'value')
      if(!type) type = 'r'
      if(!tier) tier = (type === 'r' ? 7:13)
      if(tier) tier = +tier
      if(type === 'r'){
        relicLevel = ((botSettings.maxRelic || 11) >= (tier + 2) ? tier: (botSettings.maxRelic || 11) - 2)
        gearLevel = 13
      }else{
        gearLevel = (tier < 14 ? tier:13)
      }
    }
    if(unitGear){
      msg2send.content = 'Error getting gear/relic data'
      neededGear = []
      neededRelicMats = []
      if((!pUnit || +pUnit.currentTier < gearLevel)) neededGear = await HP.GetNeededGear(pObj?.inventory?.equipment, pUnit?.equipment, unitGear, pUnit?.currentTier || 1, gearLevel)
    }
    if(type === 'r' && relicLevel >= 0){
      relicRecipe = await mongo.find('recipe', {type: 'relic'})
      if(relicRecipe?.length > 0) relicRecipe = relicRecipe.filter(x=>relicLevel >= x.tier)
    }
    if(relicRecipe?.length > 0){
      msg2send.content = 'Error getting gear/relic data'
      let currentRelicLevel = 0
      if(pUnit?.relic?.currentTier >= 2) currentRelicLevel = +pUnit.relic?.currentTier - 2
      neededRelicMats = await HP.GetNeededRelicMats(pObj?.inventory?.material, relicRecipe, currentRelicLevel, relicLevel)
    }
    if(neededRelicMats && neededGear){
      msg2send.content = 'Error getting HTML'
      let header = pObj?.player?.name+'\'s '+uInfo.nameKey
      if(pUnit){
        header += ' G'+pUnit.currentTier
        if(pUnit.currentTier == 13 && pUnit?.relic?.currentTier > 2) header += ' R'+(pUnit?.relic?.currentTier - 2)
      }
      unitHTML = await GetHTML.unit(neededGear, neededRelicMats, uInfo, {gearLevel: gearLevel, relicLevel: relicLevel, header: header })
    }
    if(unitHTML){
      msg2send.content = 'Error getting image'
      unitImg = await HP.GetImg(unitHTML, obj.id, 640, false)
    }
    if(unitImg){
      msg2send.content = null
      msg2send.file = unitImg
      msg2send.fileName = 'unit.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
