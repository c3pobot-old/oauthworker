'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let pObj, loginConfirm, msg2send = 'You must have you google auth linked to your discordId'
    if(obj?.confirm?.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj?.uId && dObj?.type){
      await HP.ReplyButton(obj, 'Getting player data ...')
      msg2send = 'Error Getting player data'
      const data = await Client.oauth(obj, 'getInitialData', dObj, {}, loginConfirm);
      if(data?.data) pObj = data.data
      if(data?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj?.allyCode)
        return;
      }
    }
    return { msg2send: msg2send, data: pObj }
  }catch(e){
    console.error(e);
  }
}
