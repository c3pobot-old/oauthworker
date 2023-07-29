'use strict'
module.exports = (playerId, members)=>{
  try{
    return members.find(x=>x.playerId === playerId)
  }catch(e){
    console.error(e);
  }
}
