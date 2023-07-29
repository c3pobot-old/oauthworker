'use strict'
module.exports = async(totalKeys, difficultyType, conquestDefinitionIdentifier)=>{
  let rewards, tempObj
  const cqDef = (await mongo.find('cqDef', {_id: conquestDefinitionIdentifier}))[0]
  if(cqDef) rewards = cqDef.conquestDifficulty.find(x=>x.id == difficultyType).rankRewardPreview
  if(rewards){
    tempObj = {}
    tempObj.current = rewards.find(x=>totalKeys >= x.rankStart && (x.rankEnd >= totalKeys || x.rankEnd == 0))
    if(tempObj.current && tempObj.current.rankEnd != 0) tempObj.next = rewards.find(x=>x.rankStart == +tempObj.current.rankEnd + 1)
    if(tempObj.next && tempObj.next.rankEnd != 0) tempObj.max = rewards.find(x=>x.rankEnd == 0)
  }
  return tempObj
}
