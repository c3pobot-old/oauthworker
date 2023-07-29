'use strict'
module.exports = async(baseId, members = [], playerUnitCount = {}, maxUnit = 10)=>{
  try{
    return await members.filter(x=>x.rosterUnit?.filter(y=>y.definitionId?.startsWith(baseId+':') && (!playerUnitCount[x?.playerId] || maxUnit > playerUnitCount[x?.playerId])).length > 0 ).map(m=>{
      let rosterUnits = m.rosterUnit.filter(y=>y.definitionId?.startsWith(baseId+':'))
      return Object.assign({},{
        player: m.name,
        playerId: m.playerId,
        allyCode: m.allyCode,
        baseId: baseId,
        relicTier: rosterUnits[0].relic?.currentTier,
        rarity: rosterUnits[0].currentRarity,
        level: rosterUnits[0].currentLevel,
        tier: rosterUnits[0].currentTier,
        gp: rosterUnits[0].gp,
        combatType: rosterUnits[0].combatType,
        sort: rosterUnits[0].sort
      })
    })
  }catch(e){
    console.error(e);
  }
}
