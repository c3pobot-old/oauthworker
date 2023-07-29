'use strict'
const enumTW = require('./enumTWZones')
const CheckDefeated = (obj)=>{
	if(obj.filter(x=>parseInt(x.unitState.healthPercent) > 0 && x.squadUnitType !== 3 && x.squadUnitType !== 5).length > 0){
		return "Alive"
	}else{
		return "Defeated"
	}
}
module.exports = async(obj)=>{
	try{
		let status = 'ok'
	  for(let i in obj.awayGuild){
	    obj.banners.away.finalScore += parseInt(obj.awayGuild[i].zoneStatus.score)
	    obj.banners.away.bestScore += parseInt(obj.awayGuild[i].zoneStatus.score)
	    obj.banners.home.defeatedTotal += (obj.awayGuild[i].squadCapacity - obj.awayGuild[i].squadCount)
	    const tempObj = {
	      nameKey: enumTW.zones[obj.awayGuild[i].zoneStatus.zoneId].nameKey,
	      totalSquads: obj.awayGuild[i].squadCapacity,
	      defeatedSquads: obj.awayGuild[i].squadCapacity - obj.awayGuild[i].squadCount,
	      combatType: ((enumTW.zones[obj.awayGuild[i].zoneStatus.zoneId].nameKey !== "S1" && enumTW.zones[obj.awayGuild[i].zoneStatus.zoneId].nameKey !== "S2")? 1 : 2),
	      charDrops: 0,
	      charBannerDrops: 0,
	      shipDrops: 0,
	      shipBannerDrops: 0,
	      clear: 1
	    }
	    if(obj.awayGuild[i].squadCount > 0){
	      obj.banners.home.clear = 0
	      tempObj.clear = 0
	    }
	    if(tempObj.combatType === 1){
	      obj.banners.home.defeatedChar += (obj.awayGuild[i].squadCapacity - obj.awayGuild[i].squadCount)
	    }else{
	      obj.banners.home.defeatedShips += (obj.awayGuild[i].squadCapacity - obj.awayGuild[i].squadCount)
	    }
	    if(obj.awayGuild[i].squadCount !== 0){
	      if(tempObj.nameKey !== "S2" && tempObj.nameKey !== "M2" && tempObj.nameKey !== "B4"){
	        obj.banners.home.bestScore += enumTW.scores.p1.clearBonus
	        obj.banners.home.bestScore += enumTW.scores.p1.clearPerSquadBonus * obj.awayGuild[i].squadCapacity
	      }else{
	        obj.banners.home.bestScore += enumTW.scores.p4.clearBonus
	        obj.banners.home.bestScore += enumTW.scores.p4.clearPerSquadBonus * obj.awayGuild[i].squadCapacity
	      }
	      if(tempObj.combatType === 1){
	        obj.banners.home.bestScore += enumTW.scores.p1.perCharSquadMax * obj.awayGuild[i].squadCount
	      }else{
	        obj.banners.home.bestScore += enumTW.scores.p1.perShipSquadMax * obj.awayGuild[i].squadCount
	      }
	    }
	    for(let b in  obj.awayGuild[i].warSquad){
	      //update lead defends
	      if(obj.awayGuild[i].warSquad[b].successfulDefends > 1){
	        if(obj.leaders.away.filter(x=>x.unitDefId === obj.awayGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]).length>0){
	          obj.leaders.away.find(x=>x.unitDefId === obj.awayGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]).defends += (obj.awayGuild[i].warSquad[b].successfulDefends - 1)
	        }else{
	          obj.leaders.away.push({
	            unitDefId: obj.awayGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0],
	            defends: (obj.awayGuild[i].warSquad[b].successfulDefends - 1)
	          })
	        }
	      }
	      //update dropped banners
	      if(obj.awayGuild[i].warSquad[b].successfulDefends > 1){
	        if(CheckDefeated(obj.awayGuild[i].warSquad[b].squad.cell) === "Defeated"){
	          if(obj.awayGuild[i].warSquad[b].successfulDefends === 2){
	            if(tempObj.combatType === 1){
	              tempObj.charDrops += 1
	              tempObj.charBannerDrops += 5
	              obj.drops.home.charDrops += 1
	              obj.drops.home.charBannerDrops += 5
	            }else{
	              tempObj.shipDrops += 1
	              tempObj.shipBannerDrops += 5
	              obj.drops.home.shipDrops += 1
	              obj.drops.home.shipBannerDrops += 5
	            }
	          }else{
	            if(tempObj.combatType === 1){
	              tempObj.charDrops += 2
	              tempObj.charBannerDrops += 10
	              obj.drops.home.charDrops += 2
	              obj.drops.home.charBannerDrops += 10
	            }else{
	              tempObj.shipDrops += 2
	              tempObj.shipBannerDrops += 10
	              obj.drops.home.shipDrops += 2
	              obj.drops.home.shipBannerDrops += 10
	            }
	          }
	        }
	      }
	      //update defend leader
				if(obj.awayGuild[i].warSquad[b].successfulDefends){
					if(obj.awayGuild[i].warSquad[b].successfulDefends + (obj.awayGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1) > obj.defends.away.defends){
		        obj.defends.away.defends = obj.awayGuild[i].warSquad[b].successfulDefends + (obj.awayGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1)
		        obj.defends.away.name = []
		        obj.defends.away.name.push(obj.awayGuild[i].warSquad[b].playerName+" ("+obj.awayGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]+" : "+(obj.awayGuild[i].warSquad[b].squadStatus == 3 ? "Defeated" : "Alive")+")")
		      }else if(obj.awayGuild[i].warSquad[b].successfulDefends > 1 && (obj.awayGuild[i].warSquad[b].successfulDefends + (obj.awayGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1)) === obj.defends.away.defends){
		        obj.defends.away.name.push(obj.awayGuild[i].warSquad[b].playerName+" ("+obj.awayGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]+" : "+(obj.awayGuild[i].warSquad[b].squadStatus == 3 ? "Defeated" : "Alive")+")")
		      }
				}
	    }
	    if(+obj.awayGuild[i].warSquad.length != +obj.awayGuild[i].squadCapacity && +obj.awayGuild[i].warSquad.length > 0){
	      if(tempObj.combatType === 1){
	        obj.drops.home.charNotSet += +obj.awayGuild[i].squadCapacity - +obj.awayGuild[i].warSquad.length
	      }else{
	        obj.drops.home.shipNotSet += +obj.awayGuild[i].squadCapacity - +obj.awayGuild[i].warSquad.length
	      }
	    }
	    obj.zoneData.home.data.push(tempObj)
	  }
		return status
	}catch(e){
		console.log(e)
		return ('error')
	}
}
