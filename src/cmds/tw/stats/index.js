'use strict'
const GetData = require('./getData')
const GetHtml = require('webimg').chart
const GetMsg = require('./getMsg')
const ConvertData = require('./convertData')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google account linked to your discordId'}, webData, chartDefense, foundInCache, endTime, guildData, guildId, instanceId, members, joined, mapStats, loginConfirm, gObj, sendResponse = 0, chartData, totalBanners, rogueActions, bannerImg, raImg
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
      guildId = gObj.data.guild.profile?.id
      sendResponse++
      msg2send.content = 'Error getting TW data'
      if(gObj?.data?.guild?.territoryWarStatus?.length > 0 && gObj.data.guild.territoryWarStatus[0].instanceId){
        instanceId = gObj.data.guild.territoryWarStatus[0].instanceId
        endTime = gObj.data.guild.territoryWarStatus[0].currentRoundEndTime
        const battleStats = await Client.oauth(obj, 'getMapStats', dObj, {territoryMapId: gObj.data.guild.territoryWarStatus[0]?.instanceId}, loginConfirm)
        if(battleStats?.data?.currentStat) mapStats = battleStats.data.currentStat
        joined = gObj.data.guild.territoryWarStatus[0].optedInMember.map(m => m.memberId)
        if(joined?.length > 0) members = gObj.data.guild.member.filter(x=>joined.includes(x.playerId))
        guildData = await GetData(gObj.data.guild.territoryWarStatus[0])
        if(guildData){
          const tempObj = {guildData: guildData}
          await ConvertData(tempObj)
          if(tempObj.chartDefense) chartDefense = tempObj.chartDefense
        }
      }else{
        msg2send.content = 'There is not a TW in progress and there is no cached data in the database'
        let cacheData = await mongo.find('twStats', {guildId: gObj?.data?.guild?.profile?.id})
        if(cacheData?.length > 0){
          let tempObj = cacheData[cacheData?.length - 1]
          if(tempObj?.chartData) chartData = tempObj.chartData
          if(tempObj?.guildData) guildData = tempObj.guildData
          if(tempObj?.endTime) endTime = tempObj.endTime
          if(tempObj?.chartDefense) chartDefense = tempObj.chartDefense
          if(tempObj?.guildData && !tempObj.chartDefense){
            await ConvertData(tempObj)
            if(tempObj.chartDefense){
              chartDefense = tempObj.chartDefense
              await mongo.set('twStats', {_id: tempObj._id}, { chartDefense: tempObj.chartDefense })
            }
          }
          foundInCache = true
        }
      }
    }
    if(members?.length > 0){
      msg2send.content = 'error parsing data for members'
      chartData = []
      for(let i in members){
        const tempObj = {
          name: members[i].playerName,
          total: +mapStats.filter(x=>x.mapStatId === 'stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          attack: +mapStats.filter(x=>x.mapStatId === 'attack_stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          defense: +mapStats.filter(x=>x.mapStatId === 'set_defense_stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          rogue: +mapStats.filter(x=>x.mapStatId === 'disobey')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0
        }
        chartData.push(tempObj)
      }
    }
    if(chartData?.length > 0 && guildData && chartDefense){
      msg2send.content = 'error getting html'
      if(instanceId && guildId && !foundInCache) await mongo.set('twStats', {_id: guildId+'-'+instanceId}, {chartData: chartData, guildData: guildData, chartDefense: chartDefense, guildId: guildId, instanceId: instanceId, endTime: endTime})
      webData = []
      let bannerObj = { fileName: 'banners.png' }
      bannerObj.html = await GetHtml(chartData, {
        sort: 'total',
        title: 'Total Banners',
        chart: [{name: 'Defense', data: 'defense', type: 'bar', bgcolor: '#0000FF'}, {name: 'Offense', data: 'attack', type: 'bar', bgcolor: '#FFA500'}]
      })
      if(bannerObj?.html) webData.push(bannerObj)
      let raObj = { fileName: 'ra.png'}
      raObj.html = await GetHtml(chartData, {
        sort: 'attack',
        title: 'Efficency',
        chart: [{name: 'Rouge Actions', yId: 'rogue', data: 'rogue', type: 'line', bgcolor: '#FFA500'}, {name: 'Offense', data: 'attack', type: 'bar', bgcolor: '#0000FF'}]
      })
      if(raObj?.html) webData.push(raObj)
      let homeObj = { fileName: 'home.png'}
      if(chartDefense.homeDefense?.length > 0) homeObj.html = await GetHtml(chartDefense.homeDefense, {
        sort: 'total',
        title: 'Home Defense',
        chart: [{name: 'Total Squads', data: 'total', type: 'bar', bgcolor: '#0000FF'}, {name: 'Extra Battles', data: 'diff', type: 'bar', bgcolor: '#FFA500'}]
      })
      if(homeObj.html) webData.push(homeObj)
      let awayObj = { fileName: 'away.png'}
      if(chartDefense.awayDefense?.length > 0) awayObj.html = await GetHtml(chartDefense.awayDefense, {
        sort: 'total',
        title: 'Away Defense',
        chart: [{name: 'Total Squads', data: 'total', type: 'bar', bgcolor: '#0000FF'}, {name: 'Extra Battles', data: 'diff', type: 'bar', bgcolor: '#FFA500'}]
      })
      if(awayObj.html) webData.push(awayObj)
    }
    if(webData?.length === 4){
      msg2send.content = 'error getting images'
      let errorCount = 0
      for(let i in webData){
        webData[i].file = await HP.GetImg(webData[i].html, obj.id, 1440, false)
        if(!webData[i].file){
          errorCount++
          break;
        }else{
          delete webData[i].html
        }
      }
      if(errorCount) webData = []
    }
    if(webData?.length === 4){
      let twDate
      if(endTime){
        twDate = new Date(+endTime).toLocaleDateString('en-US', {
          timeZone: 'America/New_York',
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        })
      }
      msg2send.files = webData
      msg2send.content = null

      if(twDate){
        if(!msg2send.content) msg2send.content = ''
        msg2send.content += '<'+process.env.WEB_CONFIG_URL+'/tw?guildId='+guildData.home.id+'&date='+twDate+'>\n'
      }
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
