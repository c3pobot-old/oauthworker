'use strict'
module.exports = async(obj = {}, dObj = {}, loginConfirm)=>{
  try{
    let twData = await Client.oauth(obj, 'getTerritoryMapStatus', dObj, { eventType: 8}, loginConfirm)
    if(twData?.error == 'invalid_grant'){
      await HP.ReplyTokenError(obj, dObj.allyCode)
      return;
    }
    if(twData?.data) return twData.data
    return twData
  }catch(e){
    throw(e)
  }
}
