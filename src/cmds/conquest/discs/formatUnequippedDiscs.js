'use strict'
module.exports = async(obj = [], discDef = {})=>{
  try{
    let res = [], tempArtifact = {}
    if(obj.length > 0){
      for(let i in obj){
        if(!tempArtifact[obj[i].definitionId]){
          let tempObj = discDef[obj[i].definitionId]
          if(!tempObj){
            tempObj = (await mongo.find('dataDisc', {_id: obj[i].definitionId}))[0]
            if(tempObj) discDef[obj[i].definitionId] = tempObj
          }
          if(tempObj){
            tempArtifact[obj[i].definitionId] = tempObj
            tempArtifact[obj[i].definitionId].count = 0
          }
        }
        if(tempArtifact[obj[i].definitionId]) tempArtifact[obj[i].definitionId].count++;
      }
    }
    const tempRes = Object.values(tempArtifact)
    if(tempRes.length > 0) res = tempRes
    return res
  }catch(e){
    console.error(e);
  }
}
