'use strict'
const Cmds = {}
Cmds.manual = require('./manual')
Cmds.oauth = require('./oauth')
module.exports = async(obj, opt)=>{
  try{
    let tempCmd = 'oauth'
    if(opt.find(x=>x.name == 'allycode')) tempCmd = 'manual'
    await Cmds[tempCmd](obj, opt)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
