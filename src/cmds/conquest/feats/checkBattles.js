'use strict'
module.exports = async(nodeStatus, nodeSelection, difficultyType, conquestDefinitionIdentifier)=>{
  try{
    let res = { complete: 0, total: 0, battles: []}, tempObj, nodeInfo
    let cqDef = (await mongo.find('cqDef', {_id: conquestDefinitionIdentifier}))[0]
    if(cqDef) nodeInfo = cqDef.conquestDifficulty.find(x=>x.id == difficultyType);
    if(nodeInfo){
      res.total += nodeInfo.stars
      for(let i in nodeStatus){
        if(nodeSelection.filter(x=>x.nodeId.includes(nodeStatus[i].sectorId+':'+nodeStatus[i].nodeId)).length == 0){
          const sectorInfo = nodeInfo.sector.find(x=>x.id == nodeStatus[i].sectorId)
          if(sectorInfo?.node?.filter(x=>x.id == nodeStatus[i].nodeId && (x.type == 1 || x.type == 5 )).length > 0){
            if(nodeStatus[i].progress > 4) res.complete += nodeStatus[i].progress - 4
            if(nodeStatus[i].progress < 7){
              if(!tempObj) tempObj = {}
              if(!tempObj[nodeStatus[i].sectorId]) tempObj[nodeStatus[i].sectorId] = {
                bossCount: 0,
                basicCount: 0,
                totalStars: sectorInfo.stars,
                sector: +(nodeStatus[i].sectorId.replace('S', '')) + 1
              }
              if(tempObj[nodeStatus[i].sectorId]) tempObj[nodeStatus[i].sectorId].basicCount += (7 - +nodeStatus[i].progress)
            }
          }
        }
      }
      if(tempObj) res.battles = Object.values(tempObj)
    }
    return res
  }catch(e){
    console.error(e)
  }
}
