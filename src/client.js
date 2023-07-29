'use strict'
const SwgohClient = require('stub')
const bottleneck = require('bottleneck')
const limiter = new bottleneck({
  minTime: 10,
  maxConcurrent: 20
})
module.exports.post = async(method, opt = {}, identity = null)=>{
  try{
    return await limiter.schedule(()=>SwgohClient.post(method, opt, identity))
  }catch(e){
    console.error(e);
  }
}
module.exports.oauth = async(obj, method, dObj, payload, loginConfirmed = null)=>{
  try{
    return await limiter.schedule(()=>SwgohClient.oauth(obj, method, dObj, payload, loginConfirmed))
  }catch(e){
    console.error(e);
  }
}
module.exports.Google = SwgohClient.Google
