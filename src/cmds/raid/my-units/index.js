'use strict'
module.exports = async(obj = {}, opts = [])=>{
  try{
    let msg2send = { content: 'Coming soon (tm)'}
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
