'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let cqData, loginConfirm, pObj, msg2send = 'You must have you google or guest auth linked to your discordId'
    let getCache = await HP.GetOptValue(opt, 'cache')
    if(obj?.confirm?.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj?.allyCode && getCache == true){
      msg2send = 'There was no cached data in the db'
      cqData = (await mongo.find('conquestCache', {_id: dObj?.allyCode}))[0]
    }
    if(!getCache && dObj?.uId && dObj?.type){
      await HP.ReplyButton(obj, 'Getting info for conquest ...')
      msg2send = 'Error Getting player data'
      pObj = await Client.oauth(obj, 'getInitialData', dObj, {}, loginConfirm);
      if(pObj?.error){
        await HP.ReplyTokenError(obj, dObj?.allyCode, pObj.error)
        return;
      }
    }
    if(pObj?.data?.conquestStatus && pObj?.data?.gameEvent && pObj?.data?.challengeProgress){
      cqData = {
        name: pObj.data.player?.name,
        allyCode: +(pObj.data.player?.allyCode || 0),
        guild: pObj.data.guild?.profile?.name,
        inventory: (pObj.data.inventory?.currencyItem?.filter(x=>x.currency == 39) || []),
        unit: (pObj.data.inventory?.unit || []),
        conquestStatus: pObj.data.conquestStatus,
        gameEvent: pObj.data.gameEvent,
        challengeProgress: pObj.data.challengeProgress,
        updated: Date.now()
      }
      await mongo.set('conquestCache', {_id: dObj.allyCode}, cqData)
    }
    return {msg2send: msg2send, data: cqData}
  }catch(e){
    console.error(e);
  }
}
