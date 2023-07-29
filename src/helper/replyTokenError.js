'use strict'
module.exports = async(obj, allyCode, description)=>{
  try{
    let msg2send = {content: description}
    if(description === 'invalid_grant'){
      console.error('Google Token Error for allyCode: '+allyCode)
      msg2send.content = 'Your google auth has been revoked or expired. Please re auth the bot using the `/allycode auth google` command'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
  }
}
