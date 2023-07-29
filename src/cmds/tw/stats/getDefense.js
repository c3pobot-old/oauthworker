'use strict'

const GetNewObj = async(leader)=>{
  try{
    let uInfo = unitList[leader?.baseId]
    if(uInfo) return { baseId: leader.baseId, nameKey: uInfo.name, total: 0, battles: 0}
  }catch(e){
    console.error(e);
  }
}
const CheckDefeated = (obj)=>{
	if(obj.filter(x=>parseInt(x.unitState.healthPercent) > 0 && x.squadUnitType !== 3 && x.squadUnitType !== 5).length > 0){
		return 0
	}else{
		return 1
	}
}
module.exports = async( defense = {}, warSquad = [] )=>{
  try{
    for(let i in warSquad){
      let leader = warSquad[i]?.squad?.cell?.find(x=>x.squadUnitType === 2 || x.squadUnitType === 3)
      if(leader) leader.baseId = leader.unitDefId.split(':')[0]
      if(leader.baseId){
        if(!defense[leader.baseId]) defense[leader.baseId] = await GetNewObj(leader)
        if(defense[leader.baseId]){
          defense[leader.baseId].total++
          defense[leader.baseId].battles += warSquad[i]?.successfulDefends || 0
        }
      }
    }
  }catch(e){
    console.error(e);
  }
}
