'use strict'
const Cmds = {}
Cmds.char = require('./char')
Cmds.low = require('./low')
Cmds.total = require('./total')
module.exports = async(obj, opt = [])=>{
  try{
    let tempCmd, opts = []
    for(let i in opt){
      if(Cmds[opt[i].name]){
        tempCmd = opt[i].name
        if(opt[i].options) opts = opt[i].options
        break
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opts)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
