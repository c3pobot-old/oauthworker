'use strict'
module.exports = async(array = [])=>{
  try{
    let memberIds, members
    if(array?.length > 0) memberIds = array.map(x=>x.playerId)
    if(memberIds?.length > 0){
      members = await mongo.find('playerCache', {_id: {$in: memberIds}}, { playerId: 1, name: 1, allyCode: 1 })
    }
    if(memberIds?.length > 0 && members?.length >= 0 && members?.length != memberIds.length){
      const foundMembers = members.map(x=>x.playerId)
      const missingMembers = array.filter(x=>!foundMembers.includes(x.playerId))
      const tempMembers = await Client.post('queryArenaPlayers', {players: missingMembers, detailsOnly: false})
      if(tempMembers?.length > 0) members = members.concat(tempMembers)
    }
    if(memberIds.length > 0 && members?.length == memberIds.length){
      return members
    }
  }catch(e){
    console.error(e);
  }
}
