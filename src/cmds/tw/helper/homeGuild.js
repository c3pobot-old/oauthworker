'use strict'
const enumTW = require('./enumTWZones')
const CheckDefeated = (obj)=>{
	if(obj.filter(x=>parseInt(x.unitState.healthPercent) > 0 && x.squadUnitType !== 3 && x.squadUnitType !== 5).length > 0){
		return "Alive"
	}else{
		return "Defeated"
	}
}
module.exports = (obj)=>{
	try{
		let status = 'ok'
		for(let i in obj.homeGuild){
	    obj.banners.home.finalScore += parseInt(obj.homeGuild[i].zoneStatus.score)
	    obj.banners.home.bestScore += parseInt(obj.homeGuild[i].zoneStatus.score)
	    obj.banners.away.defeatedTotal += (obj.homeGuild[i].squadCapacity - obj.homeGuild[i].squadCount)
	    const tempObj = {
	      nameKey: enumTW.zones[obj.homeGuild[i].zoneStatus.zoneId].nameKey,
	      totalSquads: obj.homeGuild[i].squadCapacity,
	      defeatedSquads: obj.homeGuild[i].squadCapacity - obj.homeGuild[i].squadCount,
	      combatType: ((enumTW.zones[obj.homeGuild[i].zoneStatus.zoneId].nameKey !== "S1" && enumTW.zones[obj.homeGuild[i].zoneStatus.zoneId].nameKey !== "S2")? 1 : 2),
	      charDrops: 0,
	      charBannerDrops: 0,
	      shipDrops: 0,
	      shipBannerDrops: 0,
	      clear: 1
	    }
	    if(obj.homeGuild[i].squadCount > 0){
	      obj.banners.away.clear = 0
	      tempObj.clear = 0
	    }
	    if(tempObj.combatType === 1){
	      obj.banners.away.defeatedChar += (obj.homeGuild[i].warSquad.length - obj.homeGuild[i].squadCount)
	    }else{
	      obj.banners.away.defeatedShips += (obj.homeGuild[i].squadCapacity - obj.homeGuild[i].squadCount)
	    }
	    if(obj.homeGuild[i].squadCount !== 0){
	      if(tempObj.nameKey !== "S2" && tempObj.nameKey !== "M2" && tempObj.nameKey !== "B4"){
	        obj.banners.away.bestScore += enumTW.scores.p1.clearBonus
	        obj.banners.away.bestScore += enumTW.scores.p1.clearPerSquadBonus * obj.homeGuild[i].squadCapacity
	      }else{
	        obj.banners.away.bestScore += enumTW.scores.p4.clearBonus
	        obj.banners.away.bestScore += enumTW.scores.p4.clearPerSquadBonus * obj.homeGuild[i].squadCapacity
	      }
	      if(tempObj.combatType === 1){
	        obj.banners.away.bestScore += enumTW.scores.p1.perCharSquadMax * obj.homeGuild[i].squadCount
	      }else{
	        obj.banners.away.bestScore += enumTW.scores.p1.perShipSquadMax * obj.homeGuild[i].squadCount
	      }
	    }
	    if(+obj.homeGuild[i].warSquad.length != +obj.homeGuild[i].squadCapacity && +obj.homeGuild[i].warSquad.length > 0){
	      if(tempObj.combatType === 1){
	        obj.drops.away.charNotSet += +obj.homeGuild[i].squadCapacity - +obj.homeGuild[i].warSquad.length
	      }else{
	        obj.drops.away.shipNotSet += +obj.homeGuild[i].squadCapacity - +obj.homeGuild[i].warSquad.length
	      }
	    }
	    for(let b in  obj.homeGuild[i].warSquad){
	      //update lead defends
	      if(obj.homeGuild[i].warSquad[b].successfulDefends > 1){
	        if(obj.leaders.home.filter(x=>x.unitDefId === obj.homeGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]).length>0){
	          obj.leaders.home.find(x=>x.unitDefId === obj.homeGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]).defends += (obj.homeGuild[i].warSquad[b].successfulDefends - 1)
	        }else{
	          obj.leaders.home.push({
	            unitDefId: obj.homeGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0],
	            defends: (obj.homeGuild[i].warSquad[b].successfulDefends - 1)
	          })
	        }
	      }
	      //update dropped banners
	      if(obj.homeGuild[i].warSquad[b].successfulDefends > 1){
	        if(CheckDefeated(obj.homeGuild[i].warSquad[b].squad.cell) === "Defeated"){
	          if(obj.homeGuild[i].warSquad[b].successfulDefends === 2){
	            if(tempObj.combatType === 1){
	              tempObj.charDrops += 1
	              tempObj.charBannerDrops += 5
	              obj.drops.away.charDrops += 1
	              obj.drops.away.charBannerDrops += 5
	            }else{
	              tempObj.shipDrops += 1
	              tempObj.shipBannerDrops += 5
	              obj.drops.away.shipDrops += 1
	              obj.drops.away.shipBannerDrops += 5
	            }
	          }else{
	            if(tempObj.combatType === 1){
	              tempObj.charDrops += 2
	              tempObj.charBannerDrops += 10
	              obj.drops.away.charDrops += 2
	              obj.drops.away.charBannerDrops += 10
	            }else{
	              tempObj.shipDrops += 2
	              tempObj.shipBannerDrops += 10
	              obj.drops.away.shipDrops += 2
	              obj.drops.away.shipBannerDrops += 10
	            }
	          }
	        }
	      }
	      //update defend leader
				if(obj.homeGuild[i].warSquad[b].successfulDefends){
					if(obj.homeGuild[i].warSquad[b].successfulDefends + (obj.homeGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1) > obj.defends.home.defends){
		        obj.defends.home.defends = obj.homeGuild[i].warSquad[b].successfulDefends + (obj.homeGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1)
		        obj.defends.home.name = []
		        obj.defends.home.name.push(obj.homeGuild[i].warSquad[b].playerName+" ("+obj.homeGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]+" : "+(obj.homeGuild[i].warSquad[b].squadStatus == 3 ? "Defeated" : "Alive")+")")
		      }else if(obj.homeGuild[i].warSquad[b].successfulDefends > 1 && (obj.homeGuild[i].warSquad[b].successfulDefends +(obj.homeGuild[i].warSquad[b].squadStatus == 3 ? 0 : 1)) === obj.defends.home.defends){
		        obj.defends.home.name.push(obj.homeGuild[i].warSquad[b].playerName+" ("+obj.homeGuild[i].warSquad[b].squad.cell[0].unitDefId.split(":")[0]+" : "+(obj.homeGuild[i].warSquad[b].squadStatus == 3 ? "Defeated" : "Alive")+")")
		      }
				}
	    }
	    obj.zoneData.away.data.push(tempObj)
	  }
		return status
	}catch(e){
		console.log(e)
		return('error')
	}
}
