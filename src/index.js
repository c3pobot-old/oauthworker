'use strict'
if(!process.env.CMD_QUE_NAME) process.env.CMD_QUE_NAME = 'oauth'
require('src/globals')
require('src/expressServer')
const QueWrapper = require('quewrapper')
const SaveSlashCmds = require('cmd2array')

const cmdQueOpts = {
  queName: process.env.CMD_QUE_NAME || 'oauth',
  numJobs: +process.env.NUM_JOBS || 1,
  queOptions: {
    redis: {
      host: process.env.REDIS_SERVER,
  		port: +process.env.REDIS_PORT,
  		password: process.env.REDIS_PASS
    }
  },
  localQue: redis,
  localQueKey: process.env.LOCAL_QUE_KEY
}
if(process.env.PRIVATE_WORKER) cmdQueOpts.queName += 'Private'
const CmdQue = new QueWrapper(cmdQueOpts)
const InitRedis = async()=>{
  try{
    await redis.init()
    const redisStatus = await redis.ping()
    if(redisStatus == 'PONG'){
      console.log('redis connection successful...')
      CheckMongo()
    }else{
      console.log('redis connection error. Will try again in 5 seconds...')
      setTimeout(InitRedis, 5000)
    }
  }catch(e){
    console.error('redis connection error. Will try again in 5 seconds...')
    setTimeout(InitRedis, 5000)
  }
}

const CheckMongo = async()=>{
  try{
    const status = await mongo.init();
    if(status > 0){
      console.log('Mongo connection successful...')
      StartServices()
    }else{
      console.error('Mongo connection error. Will try again in 5 seconds')
      setTimeout(CheckMongo, 5000)
    }
  }catch(e){
    console.error('Mongo connection error. Will try again in 5 seconds')
    setTimeout(CheckMongo, 5000)
  }
}
//
const StartServices = async()=>{
  try{
    if(process.env.POD_NAME?.toString().endsWith("0")) await SaveSlashCmds(baseDir+'/src/cmds', 'oauth')
    await CreateCmdMap()
    await UpdateBotSettings()
    CheckAPIReady()
    StartQue()
  }catch(e){
    console.error(e);
    setTimeout(StartServices, 5000)
  }
}

const CreateCmdMap = async()=>{
  try{
    const obj = (await mongo.find('slashCmds', {_id: 'oauth'}))[0]
    if(obj?.cmdMap) CmdMap = obj.cmdMap
    setTimeout(CreateCmdMap, 60000)
  }catch(e){
    console.error(e);
    setTimeout(CreateCmdMap, 5000)
  }
}
const CheckAPIReady = async()=>{
  const obj = await Client.post('metadata')
  if(obj?.latestGamedataVersion){
    console.log('API is ready ..')
    UpdateGameData()
  }else{
    console.log('API is not ready. Will try again in 5 seconds')
    setTimeout(()=>CheckAPIReady(), 5000)
  }
}

const UpdateGameData = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: 'gameData'}))[0]
    if(obj?.version !== gameVersion && obj?.data){
      console.log('Setting new gameData to '+obj.version)
      gameVersion = obj.version;
      gameData = obj.data
      HP.UpdateUnitsList()
      gameDataReady = 1
    }
    setTimeout(UpdateGameData, 5000)
  }catch(e){
    console.log(e)
    setTimeout(UpdateGameData, 5000)
  }
}
const UpdateBotSettings = async()=>{
  try{
    const obj = (await mongo.find('botSettings', {_id: "1"}))[0]
    if(obj) botSettings = obj
    setTimeout(UpdateBotSettings, 60000)
  }catch(e){
    setTimeout(UpdateBotSettings, 5000)
    console.error(e)
  }
}
const StartQue = ()=>{
  try{
    if(gameDataReady && CmdMap){
      CmdQue.start()
    }else{
      setTimeout(StartQue, 5000)
    }
  }catch(e){
    console.error(e);
    setTimeout(StartQue, 5000)
  }
}
InitRedis()
