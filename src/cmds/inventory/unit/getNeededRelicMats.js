'use strict'
const GetMissingRelicMats = require('./getMissingRelicMats')
module.exports = async(inventory = [], relicRecipe = [], currentTier)=>{
  try{
    let neededMats = {}
    for(let i in relicRecipe){
      if(relicRecipe[i].tier > currentTier){
        for(let m in relicRecipe[i].ingredients){
          if(relicRecipe[i].ingredients[m].qty > 0){
            if(!neededMats[relicRecipe[i].ingredients[m].id]) neededMats[relicRecipe[i].ingredients[m].id] = {
              id: relicRecipe[i].ingredients[m].id,
              nameKey: relicRecipe[i].ingredients[m].nameKey,
              iconKey: relicRecipe[i].ingredients[m].iconKey,
              count: 0}
            if(neededMats[relicRecipe[i].ingredients[m].id]) neededMats[relicRecipe[i].ingredients[m].id].count += relicRecipe[i].ingredients[m].qty
          }
        }
      }
    }
    return await GetMissingRelicMats(inventory, Object.values(neededMats))
  }catch(e){
    console.error(e);
  }
}
