'use strict'
const GetHtml = require('webimg').tb
const GetPastResults = require('./getPastResults')
const GetData = require('./getData')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have google/guest auth linked to your discordId'}, webData, tbImg
    const tbObj = await GetData(obj, opt)
    if(tbObj?.content) msg2send.content = tbObj.content
    if(tbObj?.data){
      msg2send.content = 'Error getting HTML'
      webData = await GetHtml.status(tbObj.data)
    }
    if(webData){
      msg2send.content = 'Error getting image'
      tbImg = await HP.GetImg(webData, obj.id, 1800, false)
    }
    if(tbImg){
      msg2send.content = null
      msg2send.file = tbImg
      msg2send.fileName = 'tbstatus.png'
    }
    /*
    if(tbObj && tbObj.status){
      if(tbObj.status == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj.allyCode)
        return
      }
      msg2send.content = tbObj.status
      if(tbObj && tbObj.data){
        if(tbObj.status == 'ok'){
          msg2send.content = 'error getting image'
          const screenShot = await GetHtml.status(tbObj.data)
          if(screenShot){
            msg2send.content = null
            msg2send.file = screenShot
            msg2send.fileName = 'tbstatus.png'
          }
        }else{
          msg2send.content = 'error getting tb results'
          const embedMsg = await GetPastResults(tbObj.data)
          if(embedMsg && embedMsg.title){
            msg2send.content = null,
            msg2send.embeds = [embedMsg]
          }
        }
      }
    }
    */
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
