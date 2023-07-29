'use strict'
module.exports = async(obj)=>{
  return await Client.post('fetchPlayer', obj, null)
}
