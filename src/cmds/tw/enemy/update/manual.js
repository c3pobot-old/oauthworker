'use strict'
const TWReport = require('src/cmds/tw/report')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: "This command is only avaliable to guild Admins"}, enemyId, guildId, sendResponse = 0
    if(await HP.CheckGuildAdmin(obj, opt, null)){
      msg2send.content = 'You must provide an allyCode for opponent guild'
      if(opt.find(x=>x.name == 'allycode')){
        msg2send.content = '**'+opt.find(x=>x.name == 'allycode').value+'** is not a valid allyCode'
        const eObj = await HP.GetGuildId({}, {allyCode: +opt.find(x=>x.name == 'allycode').value.replace(/-/g, '')}, [])
        if(eObj && eObj.guildId) enemyId = eObj.guildId
      }
      const pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
      if(pObj && pObj.guildId){
        guildId = pObj.guildId
      }else{
        msg2send.content = 'You do not have allycode linked to discordId'
      }
      if(guildId && enemyId){
        await mongo.set('twStatus', {_id: guildId}, {enemy: enemyId, joined: []})
        await TWReport(obj, opt, true)
      }else{
        sendResponse++
      }
    }else{
      sendResponse++
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
