'use strict'
const twStats = require('./helper')
const GetHtml = require('webimg').tw
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, loginConfirm, gObj, sendResponse = 0, webData, webHTML, webImg
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    let dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.uId && dObj.type){
      await HP.ReplyButton(obj, 'Pulling guild data ...')
      msg2send.content = 'Error getting guild data'
      gObj = await Client.oauth(obj, 'guild', dObj, {}, loginConfirm)
      if(gObj?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj.allyCode)
        return;
      }
    }else{
      sendResponse++
    }
    if(gObj?.data?.guild){
      sendResponse++
      msg2send.content = 'There is not a TW in progress'
      if(gObj?.data?.guild?.territoryWarStatus?.length > 0 && gObj.data.guild.territoryWarStatus[0].awayGuild){
        msg2send.content = 'Error calculating stats'
        let guildData = gObj.data.guild.territoryWarStatus[0]
        let battleStats = await Client.oauth(obj, 'getMapStats', dObj, {territoryMapId: guildData?.instanceId}, loginConfirm)
        if(battleStats?.data?.currentStat && guildData) guildData.currentStat = battleStats.data.currentStat
        guildData.instanceInfo = gObj.data.guild.guildEvents.find(x=>x.id == guildData.instanceId.split(':')[0])
        webData = await twStats(guildData, gObj.data.guild.profile.id)
      }
    }
    if(webData){
      msg2send.content = 'error getting html'
      webHTML = GetHtml.status(webData)
    }
    if(webHTML){
      msg2send.content = 'error getting image'
      webImg = await HP.GetImg(webHTML, obj.id, 1240, false )
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'twstatus.png'
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
