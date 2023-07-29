'use strict'
const GetMemberPrevious = require('../getMemberPrevious')
const getMember = require('../getMember')
const GetHTML = require('webimg').raid
const timeTillEnd = (endTime)=>{
  try{
    let d = 0, h = 0, m = 0, s = 0
    let timeDiff = +endTime - +(Date.now())
    if(timeDiff){
      timeDiff = timeDiff / 1000
      d = (Math.floor(timeDiff / 86400) || 0)
      h = (Math.floor((timeDiff - (d * 86400)) / 3600) || 0)
      m = (Math.floor((timeDiff - (d * 86400) - (h * 3600)) / 60) || 0)
      s = ((timeDiff - (d * 86400) - (h * 3600) - (m * 60)) || 0)
      return 'Time left '+d?.toString()?.padStart('0', 2)+' Day(s) '+h?.toString()?.padStart('0', 2)+' Hour(s) '+m?.toString()?.padStart('0', 2)+' Minute(s)'
    }
  }catch(e){
    console.error(e);
  }
}
module.exports = async(obj = {}, opts = [])=>{
  try{
    let sendMsg = true, tempCmd, loginConfirm, msg2send = {content: 'You do not have google or fb linked'}, sendResponse = 1, gObj, raidDef, raid, previousScores, raidHTML, raidImg
    if(obj?.confirm){
      await HP.ReplyButton(obj, null)
      loginConfirm = obj.confirm.response
    }
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opts)
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting data'

      gObj = await Client.oauth(obj, 'guild', dObj, {}, loginConfirm)
      if(gObj?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      /*
      let tempObj = (await mongo.find('webTemp', {_id: 'guild'}))[0]
      if(tempObj?.data) gObj = { data: {guild: tempObj.data}}
      */
    }else{
      sendResponse++
    }
    if(gObj?.data?.guild){
      sendResponse++
      msg2send.content = 'There is not a raid in progress'
      gObj = gObj.data.guild
    }
    if(gObj?.member?.length > 0 && gObj?.raidStatus?.length > 0){
      msg2send.content = 'Error getting raid definition'
      raid = {id: gObj.raidStatus[0].raidId, profile: gObj.profile, mission: gObj.raidStatus[0].identifier?.campaignMissionId, endTime: gObj.raidStatus[0].expireTime, leaderBoard: [], score: +(gObj.raidStatus[0].guildRewardScore || 0), reward: {} }
      if(raid?.id) raidDef = (await mongo.find('raidDef', {_id: raid.id}))[0]
      previousScores = await GetMemberPrevious(gObj.raidResult, raid.id)
    }
    if(raid?.id && raidDef?.nameKey){
      msg2send.content = 'Error calculating data'
      let raidRewards = raidDef.mission.find(x=>x.id === raid?.mission)?.rewards
      raid.nameKey = raidDef.nameKey
      for(let i in gObj.raidStatus[0].raidMember){
        let player = await getMember(gObj.raidStatus[0].raidMember[i].playerId, gObj.member)
        if(player){
          let tempObj = {name: player.playerName, previous: {low: 0, avg: 0, high: 0}}
          if(previousScores && previousScores[player.playerId]) tempObj.previous = previousScores[player.playerId]
          raid.leaderBoard.push({...gObj.raidStatus[0].raidMember[i],...tempObj})
        }
      }
      if(raid.score > 0 && raidRewards?.length > 0){
        raid.reward.current = raidRewards?.find(x=>raid.score >= x.rankStart && (x.rankEnd > raid.score || x.rankEnd === 0))
        raid.reward.next = raidRewards?.find(x=>x.rankStart === (raid.reward?.current?.rankEnd || 0) + 1)
      }
      if(raid.leaderBoard?.length > 0){
        raid.leaderBoard = await sorter([{column: 'memberRank', order: 'ascending'}], raid.leaderBoard)
        if(previousScores.guildTotal) raid.leaderBoard.unshift({...{name: 'Guild Total', memberProgress: raid.score},...{previous: previousScores.guildTotal}})
      }
      raid.footer = await timeTillEnd(raid.endTime)
      //await mongo.set('webTemp', {_id: 'raidData'}, {data: raid})
    }
    if(raid?.leaderBoard?.length > 0){
      msg2send.content = 'error getting HTML'
      raidHTML = await GetHTML.status(raid)
    }
    if(raidHTML){
      msg2send.content = 'error getting image'
      raidImg = await HP.GetImg(raidHTML, obj.id, 900, false)
    }
    if(raidImg){
      msg2send.content = null
      msg2send.file = raidImg
      msg2send.fileName = gObj?.profile?.name+'-'+raidDef?.id+'-raid.png'
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
