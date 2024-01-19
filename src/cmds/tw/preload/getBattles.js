'use strict'
const formatDate = (timestamp)=>{
  return (new Date(+timestamp)).toLocaleString('en-US', {timeZone: 'America/New_York'})
}
module.exports = (events = [], squad = {})=>{
  let battleStart = events.filter(x=>x.data[0]?.payload?.warSquad?.squadId === squad.squadId && x.data[0]?.payload?.warSquad?.squadStatus === 'SQUADLOCKED').map(x=>{
    return Object.assign({}, {
      playerId: x.authorId,
      playerName: x.authorName,
      timestamp: x.timestamp,
      startUnits: x.data[0]?.payload?.warSquad?.squad?.cell?.filter(y=>y.unitState?.healthPercent > 0)?.length,
      totalUnits: x.data[0]?.payload?.warSquad?.squad?.cell?.length,
      startTM: x.data[0]?.payload?.warSquad?.squad?.cell?.filter(y=>y.unitState?.turnPercent > 0)?.length,
      battleNum: x.data[0]?.payload?.warSquad?.successfulDefends,
      squadStatus: x.data[0]?.payload?.warSquad?.squadStatus
    })
  })
  let battleFinish = events.filter(x=>x.data[0]?.payload?.warSquad?.squadId === squad.squadId && x.data[0]?.payload?.warSquad?.squadStatus !== 'SQUADLOCKED').map(x=>{
    return Object.assign({}, {
      playerId: x.authorId,
      playerName: x.authorName,
      timestamp: x.timestamp,
      finishUnits: x.data[0]?.payload?.warSquad?.squad?.cell?.filter(y=>y.unitState?.healthPercent > 0)?.length,
      totalUnits: x.data[0]?.payload?.warSquad?.squad?.cell?.length,
      finsihTM: x.data[0]?.payload?.warSquad?.squad?.cell?.filter(y=>y.unitState?.turnPercent > 0)?.length,
      battleNum: x.data[0]?.payload?.warSquad?.successfulDefends,
      squadStatus: x.data[0]?.payload?.warSquad?.squadStatus
    })
  })
  squad.log = []
  squad.preload = false
  for(let i in battleStart){
    let complete = battleFinish?.find(x=>x.playerId === battleStart[i].playerId && x.battleNum === battleStart[i].battleNum)
    if(!complete){
      complete = {
        finishUnits: battleStart[i].startUnits,
        totalUnits: battleStart[i].totalUnits,
        finsihTM: battleStart[i].startTM,
        squadStatus: 'UNKNOWN'
      }
    }
    let tempObj = {...battleStart[i],...complete}
    tempObj.playerPreloaded = false
    tempObj.dateTime = formatDate(battleStart[i].timestamp)
    if(tempObj.squadStatus === 'SQUADAVAILABLE' && tempObj.finsihTM && !tempObj.startTM){
      if(tempObj.startUnits === tempObj.finishUnits && !squad.preload){
        tempObj.playerPreloaded = true
        squad.preload = true
      }
    }
    squad.log.push(tempObj)
  }
}
