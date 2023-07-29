'use strict'
module.exports = async( data = {})=>{
  try{
    data.chartDefense = {}
    let squad = {}
    for(let i in data.guildData?.homeDefense){
      for(let s in data.guildData.homeDefense[i].squad){
        if(!squad[data.guildData.homeDefense[i].squad[s].baseId]){
          squad[data.guildData.homeDefense[i].squad[s].baseId] = data.guildData.homeDefense[i].squad[s]
        }else{
          squad[data.guildData.homeDefense[i].squad[s].baseId].total += data.guildData.homeDefense[i].squad[s].total
          squad[data.guildData.homeDefense[i].squad[s].baseId].battles += data.guildData.homeDefense[i].squad[s].battles
        }
      }
    }
    let homeArray = Object.values(JSON.parse(JSON.stringify(squad)))
    for(let i in homeArray){
      let diff = +homeArray[i].battles - +homeArray[i].total
      if(diff < 0) diff = 0
      homeArray[i].diff = diff
      homeArray[i].name = homeArray[i].nameKey
    }
    squad = {}
    for(let i in data.guildData?.awayDefense){
      for(let s in data.guildData.awayDefense[i].squad){
        if(!squad[data.guildData.awayDefense[i].squad[s].baseId]){
          squad[data.guildData.awayDefense[i].squad[s].baseId] = data.guildData.awayDefense[i].squad[s]
        }else{
          squad[data.guildData.awayDefense[i].squad[s].baseId].total += data.guildData.awayDefense[i].squad[s].total
          squad[data.guildData.awayDefense[i].squad[s].baseId].battles += data.guildData.awayDefense[i].squad[s].battles
        }
      }
    }
    let awayArray = Object.values(JSON.parse(JSON.stringify(squad)))
    for(let i in awayArray){
      let diff = +awayArray[i].battles - +awayArray[i].total
      if(diff < 0) diff = 0
      awayArray[i].diff = diff
      awayArray[i].name = awayArray[i].nameKey
    }
    data.chartDefense.homeDefense = homeArray
    data.chartDefense.awayDefense = awayArray
  }catch(e){
    console.error(e);
  }
}
