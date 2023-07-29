'use strict'
const GetGearParts = require('./getGearParts')
const GetMissingGear = require('./getMissingGear')
module.exports = async(inventory = [], equipment = [], unitGear = {}, currentTier = 1, gearLevel = 13)=>{
  try{
    let neededGear = {}
    for(let i = +currentTier; i < gearLevel; i++){
      const tempUnitGear = unitGear[i]?.gear
      for (let g in tempUnitGear) {
        if (tempUnitGear[g] != '9999') {
          if (!neededGear[tempUnitGear[g]]) {
            neededGear[tempUnitGear[g]] = {
              id: tempUnitGear[g],
              count: 0
            }
          }
          if (neededGear[tempUnitGear[g]]) neededGear[tempUnitGear[g]].count++
        }
      }
    }
    if(equipment.length > 0){
      for (let i in equipment) {
        if (neededGear[equipment[i].equipmentId]) neededGear[equipment[i].equipmentId].count--
      }
    }
    const gearParts = await GetGearParts(Object.values(neededGear))
    if(gearParts?.length > 0) return await GetMissingGear(inventory, gearParts)
  }catch(e){
    console.error(e);
  }
}
