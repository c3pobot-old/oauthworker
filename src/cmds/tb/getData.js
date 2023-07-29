'use strict'
//const MapPlatoons = require('./mapPlatoons')
module.exports = async(obj, opt = [])=>{
  try{
    let gObj, battleStats, guildStats, webData, tbImg, loginConfirm, tbObj, res = {content: 'You do not have google/guest auth linked to your discordId'}
    if(obj?.confirm?.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj?.uId && dObj?.type){
      await HP.ReplyButton(obj, 'Pulling guild TB data ...')
      res.content = 'Error getting guild data'
      gObj = await Client.oauth(obj, 'guild', dObj, {}, loginConfirm)
      if(gObj?.error){
        await HP.ReplyTokenError(obj, dObj.allyCode, gObj.error)
        return;
      }
      if(gObj?.msg2send) return { content: gObj.msg2send}
    }
    if(gObj?.data?.guild){
      gObj = gObj.data.guild
      if(gObj?.territoryBattleStatus?.length > 0){
        //MapPlatoons(gObj?.territoryBattleStatus[0])
        await HP.ReplyButton(obj, 'Pulling guild TB data ...')
        res.content = 'error getting battle stats'
        battleStats = await Client.oauth(obj, 'getMapStats', dObj, {territoryMapId: gObj.territoryBattleStatus[0].instanceId}, loginConfirm)
        if(battleStats?.error == 'invalid_grant'){
          await HP.ReplyTokenError(obj, dObj.allyCode)
          return;
        }
      }else{
        res.content = 'tb not in progress'
      }
    }
    if(battleStats?.data){
      battleStats = battleStats.data
      res.content = 'Error getting guild Data'
      guildStats = await Client.post('fetchGuild', {token: obj.token, id: gObj.profile.id, projection: {playerId: 1, name: 1, gp: 1, gpChar: 1, gpShip: 1, allyCode: 1}})
    }
    if(guildStats){
      res.content = 'Error Calculating TB info'
      const tempObj = await HP.GetTBInfo(gObj, battleStats, guildStats)
      if(tempObj?.data && tempObj.status == 'ok') res.data = tempObj.data
    }
    return res
  }catch(e){
    console.error(e);
    return {content: 'error occured getting data'}
  }
}
