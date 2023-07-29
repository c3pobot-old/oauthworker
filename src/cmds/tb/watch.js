'use strict'
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, tbObj, guildId, loginConfirm, guildInfo
    if(obj?.confirm?.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj?.uId && dObj?.type && dObj?.allyCode){
      msg2send.content = 'Error Getting guildInfo'
      const pObj = await HP.GetGuildId(obj, {allyCode: +dObj.allyCode}, opt)
      if(pObj && pObj.guildId) guildId = pObj.guildId
    }
    if(guildId){
      msg2send.content = 'this command is only available to synced guilds'
      const gObj = (await mongo.find('guilds', {_id: guildId}))[0]
      if(gObj?.sync){
        await HP.ReplyButton(obj, 'Pulling guild data ...')
        msg2send.content = 'Error getting guild data'
        guildInfo = await Client.oauth(obj, 'guild', dObj, {}, loginConfirm)
        if(guildInfo?.error == 'invalid_grant'){
          await HP.ReplyTokenError(obj, dObj.allyCode)
          return;
        }
      }
    }
    if(guildInfo?.data?.guild){
      msg2send.content = 'There is not a tb in progress'
      if(guildInfo.data.guild.territoryBattleStatus?.length > 0) tbObj = guildInfo.data.guild.territoryBattleStatus[0]
    }
    if(tbObj){
      msg2send.content = 'There is only 10 minutes until reset. I need that much time to allow running the command.'
      const timeNow = Date.now()
      if((+tbObj?.currentRoundEndTime - 600000) > timeNow){
        await mongo.set('tbWatch', {_id: obj.member.user.id}, {
          currentRoundEndTime: +tbObj.currentRoundEndTime,
          dId: obj.member.user.id,
          allyCode: dObj.allyCode,
          sId: obj.guild_id,
          chId: obj.channel_id,
          guildId: guildId
        })
        const fetchTime = +tbObj.currentRoundEndTime - 600000 - 18000000
        let resetTime = new Date(fetchTime)
        msg2send.content = 'You have been set up to auto pull tb data on **'+(+resetTime.getMonth() + 1)+'/'+resetTime.getDate()+'** at **~'+resetTime.getHours().toString().padStart(2, '0')+':'+resetTime.getMinutes().toString().padStart(2, '0')+' EST**'
      }
    }
    /*
    if(tbObj?.data){
      msg2send.content = 'Error getting TB data because '+tbObj.status
      if(tbObj && tbObj.data){
        msg2send.content = 'there is not a TB in progress'
        if(tbObj.status == 'ok'){
          msg2send.content = 'There is only 10 minutes until reset. I need that much time to allow running the command. I have saved your current data'
          const timeNow = Date.now()
          if((+tbObj.data.currentRoundEndTime - 600000) > timeNow){
            await mongo.set('tbWatch', {_id: obj.member.user.id}, {
              currentRoundEndTime: +tbObj.data.currentRoundEndTime,
              dId: obj.member.user.id,
              allyCode: dObj.allyCode,
              sId: obj.guild_id,
              chId: obj.channel_id,
              guildId: guildId
            })
            const fetchTime = +tbObj.data.currentRoundEndTime - 600000 - 18000000
            let resetTime = new Date(fetchTime)
            msg2send.content = 'You have been set up to auto pull tb data on **'+(+resetTime.getMonth() + 1)+'/'+resetTime.getDate()+'** at **~'+resetTime.getHours().toString().padStart(2, '0')+':'+resetTime.getMinutes().toString().padStart(2, '0')+' EST***'
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
