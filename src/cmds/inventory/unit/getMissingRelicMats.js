'use strict'
module.exports = async(inventory = [], neededMats = [])=>{
  try{
    if(neededMats?.length > 0){
      for(let i in neededMats){
        let item = inventory.find(x=>x.id === neededMats[i].id)
        if(item?.quantity >= neededMats[i].count){
          neededMats[i].count = 0
        }else{
          if(item) neededMats[i].count -= item?.quantity
        }
      }
    }
    return await sorter([{ column: 'count', order: 'descending' }], neededMats.filter(x=>x.count > 0))
  }catch(e){
    console.error(e);
  }
}
