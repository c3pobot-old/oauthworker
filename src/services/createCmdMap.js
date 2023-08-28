'use strict'
const log = require('logger')
const CreateCmdMap = async()=>{
  try{
    const obj = (await mongo.find('slashCmds', {_id: 'oauth'}))[0]
    if(obj?.cmdMap){
      CmdMap = obj.cmdMap
      return true
    }
  }catch(e){
    throw(e);
  }
}
const Sync = async()=>{
  try{
    await CreateCmdMap()
    setTimeout(Sync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(Sync, 5000)
  }
}
module.exports = async()=>{
  try{
    let status = await CreateCmdMap()
    if(status){
      Sync()
      return true
    }
  }catch(e){
    throw(e)
  }
}
