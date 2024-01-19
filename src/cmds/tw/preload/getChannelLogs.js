'use strict'
module.exports = async(obj = {}, dObj, loginConfirm, channelId)=>{
  try{
    //let identity = (await mongo.find('identity', {_id: dObj.uId }))[0]
    let channelAuth = await Client.oauth(obj, 'createGameChannelSession', dObj, {}, loginConfirm)
    if(channelAuth?.error == 'invalid_grant'){
      await HP.ReplyTokenError(obj, dObj.allyCode)
      return;
    }
    if(!channelAuth?.data) return {error: 'Error getting Channel Session'}
    let identity = {
      androidId: dObj.uId,
      auth: channelAuth?.data,
      platform: 'Android',
      deviceId: dObj.uId
    }
    let payload = {
      eventCount: 10000,
      channelEventRequest: [{
        channelId: channelId,
        limit: 100000
      }]
    }
    let logs = await Client.post('getChannelEvents', payload, identity)
    if(logs?.event) return logs
  }catch(e){
    throw(e)
  }
}
