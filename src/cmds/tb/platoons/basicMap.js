'use strict'
const GetUnitCount = require('./getUnitCount')
const GetUnits = require('./getUnits')
const getSquadNum = require('./getSquadNum')
const pointsSort = [{column: 'points', order: 'descending'}]
const relicSort = [{column: 'relicTier', order: 'ascending'}]
const gpSort = [{column: 'gp', order: 'ascending'}]
module.exports = async(guild = [], pDef, opt=[])=>{
  try{
    const phase = await HP.GetOptValue(opt, 'phase', 'all')
    const conflict = await HP.GetOptValue(opt, 'conflict', 'all')
    const fillSquad = await HP.GetOptValue(opt, 'fill_squad', true)
    let units = {}, platoons = [], res = {}
    if(phase !== 'all') pDef.platoons = pDef.platoons.filter(x=>x.phase === phase)
    if(conflict !== 'all') pDef.platoons = pDef.platoons.filter(x=>x.conflict === conflict)
    if(phase !== 'all') pDef.platoons = await sorter([{column: 'sort', order: 'ascending'}], pDef.platoons)
    for(let i in pDef.platoons){
      let tempPlatoon = JSON.parse(JSON.stringify(pDef.platoons[i]))
      tempPlatoon.squads = []
      tempPlatoon.points = 0
      let playerUnitCount = {}
      let squads = (JSON.parse(JSON.stringify(pDef.platoons[i].squads)))
      for(let s in squads){
        let cgIsDumb = true
        if(+s === 0){
          let tempSquadNum = getSquadNum(squads[s].id)
          if(tempSquadNum == 1) cgIsDumb = false
        }
        squads[s].num = (cgIsDumb ? (+s + 1):getSquadNum(squads[s].id))
      }
      squads = await sorter(pointsSort, squads)
      for(let s in squads){
        let tempSquad = {id: squads[s].id, num: squads[s].num, units: []}
        const unitCounts = await GetUnitCount(squads[s].units)
        let squadMet = 1
        for(let u in unitCounts){
          if(!units[unitCounts[u].baseId]) units[unitCounts[u].baseId] = await GetUnits(unitCounts[u].baseId, guild, playerUnitCount, tempPlatoon.maxUnit)
          let avaliableUnits = units[unitCounts[u].baseId].filter(x=>x.level >= unitCounts[u].level && x.rarity >= unitCounts[u].rarity)
          if(unitCounts[u].combatType === 1) avaliableUnits = avaliableUnits?.filter(x=>x.tier >= unitCounts[u].tier && x.relicTier >= unitCounts[u].unitRelicTier)
          if(unitCounts[u].count > +avaliableUnits?.length && fillSquad) squadMet = 0
        }
        if(squadMet === 0) res.content = 'Your guild cannot fill any squads completely'
        if(squadMet > 0){
          for(let u in unitCounts){
            if(!units[unitCounts[u].baseId]) units[unitCounts[u].baseId] = await GetUnits(unitCounts[u].baseId, guild, playerUnitCount, tempPlatoon.maxUnit)
            let avaliableUnits = units[unitCounts[u].baseId].filter(x=>x.rarity >= unitCounts[u].rarity && (unitCounts[u].combatType === 2 || (x.relicTier >= unitCounts[u].unitRelicTier)))
            if(avaliableUnits?.length > 0) avaliableUnits = await sorter(gpSort, avaliableUnits)
            if(+avaliableUnits?.length > 0 && +avaliableUnits?.length >= unitCounts[u].count){
              for(let m = 0;m<unitCounts[u].count;m++){
                if(avaliableUnits[m]){
                  avaliableUnits[m].nameKey = unitCounts[u].nameKey
                  tempSquad.units.push(avaliableUnits[m])
                  units[unitCounts[u].baseId] = units[unitCounts[u].baseId].filter(x=>x.playerId !== avaliableUnits[m].playerId)
                  if(!playerUnitCount[avaliableUnits[m].playerId]) playerUnitCount[avaliableUnits[m].playerId] = 0
                  playerUnitCount[avaliableUnits[m].playerId] += 1
                }
              }
            }else{
              for(let m = 0;m<unitCounts[u].count;m++){
                tempSquad.units.push({nameKey: unitCounts[u].nameKey})
              }
            }
          }
        }
        if(tempSquad?.units?.length > 0){
          tempPlatoon.points += squads[s].points || 0
          tempSquad.points = numeral(squads[s].points).format('0,0')
          tempPlatoon.squads.push(tempSquad)
        }
      }
      if(tempPlatoon.squads?.length > 0){
        tempPlatoon.squads = await sorter([{column: 'num', order: 'ascending'}], tempPlatoon.squads)
        tempPlatoon.points = numeral(tempPlatoon.points).format('0,0')
        tempPlatoon.totalPoints = numeral(tempPlatoon.totalPoints).format('0,0')
        platoons.push(tempPlatoon)
      }
    }
    res.platoons = platoons
    return res
  }catch(e){
    console.error(e);
  }
}
