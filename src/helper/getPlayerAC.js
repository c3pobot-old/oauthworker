'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let dObj, dId
    let res = { mentionError: 0 }
    res.allyCode = HP.GetOptValue(opt, 'allycode')
    if(res.allyCode) res.allyCode = +(res.allyCode.trim().replace(/-/g, ''))
    dId = HP.GetOptValue(opt, 'user')
    if(!res.allyCode && dId){
      res.dId = dId
      dObj = await HP.GetDiscordAC(res.dId, opt)
      if(dObj?.allyCode){
        res = {...res,...dObj}
        res.allyCode = +dObj.allyCode
        res.playerId = dObj.playerId
      }else{
        res.mentionError++
      }
    }
    if(!res.allyCode && !res.dId && !res.mentionError && obj.member){
      res.dId = obj.member.user.id
      dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
      if(dObj?.allyCode) res = {...res,...dObj}
    }
    return res
  }catch(e){
    console.error(e)
  }
}
