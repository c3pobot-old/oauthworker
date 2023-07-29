'use strict'
const TWReport = require('src/cmds/tw/report')
module.exports = async(obj, opt)=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, loginConfirm, gObj, sendResponse = 1
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

    }
    if(gObj?.data) msg2send.content = 'There is not a TW in progress'
    if(gObj?.data?.guild?.territoryWarStatus?.length > 0 && gObj.data.guild.territoryWarStatus[0].awayGuild?.profile?.id){
      msg2send.content = 'Error getting guild data'
      await HP.ReplyButton(obj, 'Pulling opponent data ...')
      const joined = gObj.data.guild.territoryWarStatus[0].optedInMember.map(m => {
        return Object.assign({}, {
          playerId: m.memberId,
          gp: m.power
        })
      })
      const totalBattles = gObj.data.guild.territoryWarStatus[0].homeGuild.conflictStatus.reduce((acc, a)=>{return acc + a.squadCapacity},0)
      await mongo.set('twStatus', {_id: gObj.data.guild.profile.id}, {
        enemy: gObj.data.guild.territoryWarStatus[0].awayGuild.profile.id,
        joined: joined
      })
      await TWReport(obj, opt, true)
    }else{
      sendResponse++
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
