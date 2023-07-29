'use strict'
module.exports = async(u, unit)=>{
  let nameKey
  if(unit) nameKey = await HP.GetUnitName(unit.definitionId.split(':')[0])
  if(unit){
    const tempObj = Object.assign({}, u)
    tempObj.nameKey = nameKey
    tempObj.tier = +unit.currentTier
    tempObj.rarity = +unit.currentRarity
    tempObj.relic = +(unit.relic.currentTier || 0)
    tempObj.level = +unit.currentLevel
    return tempObj
  }
}
