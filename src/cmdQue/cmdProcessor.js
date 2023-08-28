'use strict'
const log = require('logger')
const deepCopy = require('./deepCopy')
const Cmds = {}
const LOCAL_QUE_KEY = process.env.LOCAL_QUE_KEY
const addtoLocalQue = async(job = {})=>{
  try{
    let obj = deepCopy(job.data)
    obj.timestamp = job.timestamp
    obj.jobId = job?.opts?.jobId
    if(!obj.id) obj.id = obj.jobId
    if(LOCAL_QUE_KEY && redis) await redis.setTTL(`${LOCAL_QUE_KEY}-${obj.jobId}`, obj, 600)
    if(HP.AddJob) await HP.AddJob(obj)
    return obj
  }catch(e){
    throw(e)
  }
}

module.exports = async(job)=>{
  try{
    let res = { status: 'no job data' }
    if(!job?.data) return res
    res.status = 'command not found'
    let obj = await addtoLocalQue(job)
    if(!obj?.data?.name || !CmdMap[obj.data.name]){
      if(LOCAL_QUE_KEY && redis) await redis.del(`${LOCAL_QUE_KEY}-${obj.jobId}`)
      return res
    }
    if(!Cmds[obj.data.name]) Cmds[obj.data.name] = require(`src/cmds/${obj.data.name}`)
    res = await Cmds[obj.data.name](obj)
    if(!res) res = {status: 'ok'}
    //if(LOCAL_QUE_KEY && redis) await redis.del(`${LOCAL_QUE_KEY}-${obj.jobId}`)
    return res
  }catch(e){
    log.error(e)
  }
}
