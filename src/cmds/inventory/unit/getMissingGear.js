'use strict'
module.exports = async(inventory = [], neededGear = [])=>{
  try{
    for(let i in neededGear){
      let item = inventory.find(x=>x.id === neededGear[i].id)
      if(item?.quantity){
        if(item?.quantity >= neededGear[i].count){
          neededGear[i].count = 0
        }else{
          if(item) neededGear[i].count -= item?.quantity
        }
      }
    }
    return await sorter([{ column: 'count', order: 'descending' }], neededGear.filter(x=>x.count > 0))
  }catch(e){
    console.error(e);
  }
}
