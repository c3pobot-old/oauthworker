'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const statCalc = require('statcalc')
const updateData = async(version)=>{
  try{
    let obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
    if(obj?.data && obj?.version === version){
      let status = statCalc.setGameData(obj.data)
      if(status){
        gameVersion = obj.version;
        gameData = obj.data
        HP.UpdateUnitsList()
        gameDataReady = 1
        return true
      }
    }
  }catch(e){
    throw(e)
  }
}
const Sync = async()=>{
  try{
    let obj = (await mongo.find('botSettings', {_id: 'gameData'}, {version: 1}))[0]
    if(obj?.version && obj?.version !== gameVersion) await updateData(obj?.version)
    setTimeout(Sync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(Sync, 5000)
  }
}
module.exports = async()=>{
  try{
    let obj = (await mongo.find('botSettings', {_id: 'gameData'}, {version: 1}))[0]
    if(!obj?.version) return
    let status = await updateData(obj?.version)
    if(status){
      Sync()
      return true
    }
  }catch(e){
    log.error(e)
  }
}
