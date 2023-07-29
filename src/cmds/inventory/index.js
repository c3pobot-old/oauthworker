'use strict'
const GetData = require('./getData')
const Cmds = {}
Cmds.unit = require('./unit')
Cmds.journey = require('./journey')
module.exports = async(obj = {})=>{
  try{
    let sendMsg = true, tempCmd, opt = [], msg2send = {content: 'command not found'}
    if(obj.data?.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    if(tempCmd){
      const pObj = await GetData(obj, opt)
      if(pObj?.msg2send) msg2send.content = pObj.msg2send
      if(pObj?.data){
        sendMsg = false
        await Cmds[tempCmd](obj, opt, pObj.data)
      }
    }
    if(sendMsg) await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
