'use strict'
const log = require('logger')
let CMD_QUE_NAME = process.env.CMD_QUE_NAME || 'oauth'
if(process.env.PRIVATE_WORKER) CMD_QUE_NAME += 'Private'
const NUM_JOBS = +(process.env.NUM_JOBS || 1)
const cmdProcessor = require('./cmdProcessor')
const processLocalQue = require('./processLocalQue')

const Queue = require('bull')
const queOpts = {
  redis: {
    host: process.env.REDIS_SERVER,
    port: +process.env.REDIS_PORT,
    password: process.env.REDIS_PASS
  },
  settings: {
    maxStalledCount: 0
  }
}
let que = new Queue(CMD_QUE_NAME, queOpts)
module.exports.start = async()=>{
  try{
    await processLocalQue()
    que.process('*', NUM_JOBS, cmdProcessor)
    log.info(`started ${CMD_QUE_NAME} processing with ${NUM_JOBS} workers`)
  }catch(e){
    throw(e)
  }
}
module.exports.removeJob = async(jobId)=>{
  try{
    let job = await que.getJob(jobId)
    if(job){
      await job.moveToCompleted(null, true, true)
      await job.remove()
    }
  }catch(e){
    return
  }
}
