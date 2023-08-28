'use strict'
const log = require('logger')
if(!process.env.CMD_QUE_NAME) process.env.CMD_QUE_NAME = 'oauth'
require('src/globals')
//require('src/expressServer')
const CmdQue = require('./cmdQue')
const SaveSlashCmds = require('cmd2array')
const UpdateBotSettings = require('./services/updateBotSettings')
const CreateCmdMap = require('./services/createCmdMap')
const UpdateGameData = require('./services/updateGameData')

const CheckRedis = ()=>{
  let status = redis.status()
  if(status){
    CheckMongo()
    return
  }
  setTimeout(CheckRedis, 5000)
}
const CheckMongo = ()=>{
  let status = mongo.status()
  if(status){
    CheckApi()
    return
  }
  setTimeout(CheckRedis, 5000)
}
const CheckApi = async()=>{
  try{
    let obj = await Client.post('metadata')
    if(obj?.latestGamedataVersion){
      CheckGameData()
      return
    }
    setTimeout(CheckApi, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckApi, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    let status = await UpdateGameData()
    if(status){
      CheckCmdMap()
      return
    }
  }catch(e){
    log.error(e)
    setTimeout(CheckGameData, 5000)
  }
}
const CheckCmdMap = async()=>{
  try{
    if(process.env.POD_NAME?.toString().endsWith("0")) await SaveSlashCmds(baseDir+'/src/cmds', 'oauth')
    let status = await CreateCmdMap()
    if(status){
      await UpdateBotSettings()
      CmdQue.start()
      return
    }
    setTimeout(CheckCmdMap, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckCmdMap, 5000)
  }
}
CheckRedis()
