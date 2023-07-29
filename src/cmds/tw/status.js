'use strict'
const twStats = require('./helper')
const GetHtml = require('webimg').tw
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, loginConfirm, gObj, sendResponse = 0
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
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
        const guildData = gObj.data.guild.territoryWarStatus[0]
        const battleStats = await Client.oauth(obj, 'getMapStats', dObj, {territoryMapId: guildData?.instanceId}, loginConfirm)
        if(battleStats?.data?.currentStat && guildData) guildData.currentStat = battleStats.data.currentStat
        guildData.instanceInfo = gObj.data.guild.guildEvents.find(x=>x.id == guildData.instanceId.split(':')[0])
        const webData = await twStats(guildData, gObj.data.guild.profile.id)
        if(webData){

          msg2send.content = 'error getting image'
          const screenShot = await GetHtml.status(webData)
          if(screenShot){
            msg2send.content = null
            msg2send.file = screenShot
            msg2send.fileName = 'twstatus.png'
          }
        }
      }
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
