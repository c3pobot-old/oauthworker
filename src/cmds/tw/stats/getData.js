'use strict'
const GetDefense = require('./getDefense')
const enumTWZones = require('./enumTWZones')
module.exports = async(guildData = {})=>{
  try{
    let glUnits
    const res = { homeScore: 0, awayScore: 0, homeDefense: {}, homeGLCount: 0, awayDefense: {}, awayGLCount: 0 }
    let tempGL = await HP.GetFaction('galactic_legend', false)
    res.home = guildData.homeGuild?.profile
    res.away = guildData.awayGuild?.profile
    if(tempGL?.units?.length > 0) glUnits = tempGL?.units
    for(let i in guildData.homeGuild?.conflictStatus){
      res.homeScore += +guildData.homeGuild.conflictStatus[i]?.zoneStatus?.score || 0
      let zoneName = enumTWZones[guildData.homeGuild.conflictStatus[i].zoneStatus?.zoneId]
      if(zoneName){
        if(!res.homeDefense[zoneName]){
          res.homeDefense[zoneName] = {
            nameKey: zoneName,
            squad: {},
            squadCapacity: guildData.homeGuild.conflictStatus[i].squadCapacity,
            squadCount: guildData.homeGuild.conflictStatus[i].squadCount
          }
        }
        if(res.homeDefense[zoneName]?.squad) await GetDefense(res.homeDefense[zoneName].squad, guildData.homeGuild.conflictStatus[i]?.warSquad)
      }
      res.homeGLCount += +guildData.homeGuild.conflictStatus[i].warSquad?.filter(x=>x.squad.cell.filter(u=>glUnits.includes(u.unitDefId.split(':')[0])).length > 0).length || 0
    }
    for(let i in guildData.awayGuild?.conflictStatus){
      res.awayScore += +guildData.awayGuild.conflictStatus[i]?.zoneStatus?.score || 0
      let zoneName = enumTWZones[guildData.awayGuild.conflictStatus[i].zoneStatus?.zoneId]
      if(zoneName){
        if(!res.awayDefense[zoneName]){
          res.awayDefense[zoneName] = {
            nameKey: zoneName,
            squad: {},
            squadCapacity: guildData.awayGuild.conflictStatus[i].squadCapacity,
            squadCount: guildData.awayGuild.conflictStatus[i].squadCount
          }
        }
        if(res.awayDefense[zoneName]?.squad) await GetDefense(res.awayDefense[zoneName].squad, guildData.awayGuild.conflictStatus[i]?.warSquad)
      }
      res.awayGLCount += +guildData.awayGuild.conflictStatus[i].warSquad?.filter(x=>x.squad.cell.filter(u=>glUnits.includes(u.unitDefId.split(':')[0])).length > 0).length || 0
    }
    return res
  }catch(e){
    console.error(e);
  }
}
