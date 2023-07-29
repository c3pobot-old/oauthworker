'use strict'
const getFeatType = (id, type = 1)=>{
  let name
  if(id.includes('S0')) name = 1
  if(id.includes('S1')) name = (type ? 1:2)
  if(id.includes('S2')) name = (type ? 2:3)
  if(id.includes('S3')) name = (type ? 3:4)
  if(id.includes('S4')) name = (type ? 4:5)
  if(id.includes('S5')) name = 5
  if(!name) name = 10
  return name
}
module.exports = async(array, type = 1)=>{
  const tempArray = array.map(x=>x.id)
  const feats = await mongo.find('cqFeats', {_id: {$in: tempArray}})
  if(feats?.length > 0){
    const res = {complete: 0, incomplete: 0, missing: []}
    for(let i in feats){
      const tempFeat = array.find(x=>x.id == feats[i].id)
      if(feats[i]?.reward && tempFeat){
        if(tempFeat.claimed){
          res.complete += +feats[i].reward
        }else{
          res.incomplete += +feats[i].reward
          const tempObj = JSON.parse(JSON.stringify(feats[i]))
          tempObj.currentValue = tempFeat.currentValue
          tempObj.completeValue = tempFeat.completeValue
          tempObj.sector = getFeatType(tempObj.id, type)
          res.missing.push(tempObj)
        }
      }
    }
    if(res.missing.length > 0) res.missing = await sorter([{column: 'sector', order: 'ascending'}], res.missing)
    return res
  }
}
