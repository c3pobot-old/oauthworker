'use strict'
const log = require('logger')
const LOCAL_QUE_KEY = process.env.LOCAL_QUE_KEY
const Que = require('./index')

module.exports = async()=>{
  try{
    if(!LOCAL_QUE_KEY || !redis) return
    let count = 0, failed = 0
    let jobs = await redis.keys(`${LOCAL_QUE_KEY}-*`)
    if(jobs?.length > 0){
      let timeNow = Date.now()
      timeNow = +timeNow - 599999
      for(let i in jobs){
        let obj = await redis.get(jobs[i])
        if(obj?.timestamp > timeNow && CmdMap[obj?.data?.name]){
          count++
          await require(`src/cmds/${obj.data.name}`)(obj)
        }else{
          failed++
        }
        await redis.del(jobs[i])
        if(jobs[i]?.jobId) await Que.removeJob(jobs[i].jobId)
      }
    }
    log.info(`Processed ${count} left over in job que. Deleted ${failed} invalid`)
  }catch(e){
    throw(e)
  }
}
