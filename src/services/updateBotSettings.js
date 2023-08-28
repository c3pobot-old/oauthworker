'use strict'
const log = require('logger')
const UpdateBotSettings = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(obj){
      botSettings = obj
      return true
    }
  }catch(e){
    setTimeout(UpdateBotSettings, 5000)
    log.error(e)
  }
}
const Sync = async()=>{
  try{
    await UpdateBotSettings()
    setTimeout(Sync, 60000)
  }catch(e){
    log.error(e)
    setTimeout(Sync, 5000)
  }
}
module.exports = Sync
