'use strict'
module.exports = (squadId)=>{
  try{
    if(squadId?.includes('-platoon-1')) return 1
    if(squadId?.includes('-platoon-2')) return 2
    if(squadId?.includes('-platoon-3')) return 3
    if(squadId?.includes('-platoon-4')) return 4
    if(squadId?.includes('-platoon-5')) return 5
    if(squadId?.includes('-platoon-6')) return 6
  }catch(e){
    console.error(e);
  }
}
