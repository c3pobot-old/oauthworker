'use strict'
module.exports = async(raidResult = [], raidId)=>{
  try{
    if(raidResult.length === 0) return
    let res = {}
    for(let i in raidResult){
      if(raidResult[i].raidId !== raidId) continue;
      if(!res.guild) res.guildTotal = {playerId: 'guildTotal', playerName: 'Guild Total', high: 0, low: 0, scores: [], dates: []}
      res.guildTotal.scores.push(+raidResult[i].guildRewardScore)
      if(+raidResult[i].guildRewardScore > res.guildTotal.high) res.guildTotal.high = +raidResult[i].guildRewardScore
      if(+raidResult[i].guildRewardScore < res.guildTotal.low || res.guildTotal.low == 0) res.guildTotal.low = +raidResult[i].guildRewardScore
      res.guildTotal.dates.push(raidResult[i].endTime)
      for(let m in raidResult[i].raidMember){
        if(!res[raidResult[i].raidMember[m].playerId]) res[raidResult[i].raidMember[m].playerId] = {playerId: raidResult[i].raidMember[m].playerId, high: 0, low: 0, scores: []}
        res[raidResult[i].raidMember[m].playerId].scores.push(+(raidResult[i].raidMember[m].memberProgress || 0))
        if(+raidResult[i].raidMember[m].memberProgress > res[raidResult[i].raidMember[m].playerId].high ) res[raidResult[i].raidMember[m].playerId].high = +raidResult[i].raidMember[m].memberProgress
        if(+raidResult[i].raidMember[m].memberProgress < res[raidResult[i].raidMember[m].playerId].low || res[raidResult[i].raidMember[m].playerId].low === 0) res[raidResult[i].raidMember[m].playerId].low = +raidResult[i].raidMember[m].memberProgress
      }
    }
    for(let i in res){
      if(!res[i]?.playerId) continue;
      let total = res[i].scores?.reduce((partialSum, a)=> partialSum + a, 0)
      res[i].avg = Math.floor(total / +res[i].scores?.length)
    }
    return res
  }catch(e){
    console.error(e);
  }
}
