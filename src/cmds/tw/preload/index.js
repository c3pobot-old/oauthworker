'use strict'
const zoneMap = {
  'tw_jakku01_phase01_conflict01': { id: 'tw_jakku01_phase01_conflict01', nameKey: 'T1'},
  'tw_jakku01_phase01_conflict02': { id: 'tw_jakku01_phase01_conflict02', nameKey: 'B1'},
  'tw_jakku01_phase02_conflict01': { id: 'tw_jakku01_phase02_conflict01', nameKey: 'T2'},
  'tw_jakku01_phase02_conflict02': { id: 'tw_jakku01_phase02_conflict02', nameKey: 'B2'},
  'tw_jakku01_phase03_conflict01': { id: 'tw_jakku01_phase03_conflict01', nameKey: 'S1'},
  'tw_jakku01_phase03_conflict02': { id: 'tw_jakku01_phase03_conflict02', nameKey: 'M1'},
  'tw_jakku01_phase03_conflict03': { id: 'tw_jakku01_phase03_conflict03', nameKey: 'B3'},
  'tw_jakku01_phase04_conflict01': { id: 'tw_jakku01_phase04_conflict01', nameKey: 'S2'},
  'tw_jakku01_phase04_conflict02': { id: 'tw_jakku01_phase04_conflict02', nameKey: 'M2'},
  'tw_jakku01_phase04_conflict03': { id: 'tw_jakku01_phase04_conflict03', nameKey: 'B4'},
}
const squadStatusMap = {
  "SQUADAVAILABLE": "Loss",
  "SQUADDEFEATED": "Win"
}
const getButtons = require('./getButtons')
const getSquads = require('./getSquads')
const getBattles = require('./getBattles')
const getMapStatus = require('./getMapStatus')
const getChannelLogs = require('./getChannelLogs')

module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, loginConfirm, method = 'PATCH', zoneId
    let conflictStatus, squads, battleLog, zoneChannelId, preload, guild, mapStatus
    if(obj.confirm){
      await HP.ReplyButton(obj, 'Here we go again ...')
      if(obj?.confirm?.response) loginConfirm = obj.confirm.response
      if(obj?.confirm?.zoneId){
        zoneId = obj?.confirm.zoneId
        method = 'POST'
      }
    }
    if(loginConfirm === 'no'){
      await HP.ReplyMsg(obj, { content: 'command canceled', components: []})
      return;
    }
    let dObj = await HP.GetDiscordAC(obj.member?.user?.id, opt)
    if(!dObj?.uId && !dObj?.type){
      await HP.ReplyMsg(obj, msg2send)
      return;
    }
    if(dObj?.uId && dObj?.type){
      msg2send.content = 'Error getting tw map status'
      mapStatus = await getMapStatus(obj, dObj, loginConfirm)
      if(mapStatus === 'GETTING_CONFIRMATION') return;
    }

    let buttons = getButtons(obj, loginConfirm)
    if(!zoneId){
      msg2send.content = 'Please pick the zone below to check for preloaders'
      msg2send.components = buttons
      await HP.ButtonPick(obj, msg2send)
      return
    }
    if(zoneId){
      msg2send.content = `Error get TW data, maybe a TW is not in progress`
      conflictStatus = mapStatus?.territoryWarStatus[0]?.awayGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
      let homeGuild = mapStatus?.territoryWarStatus[0]?.homeGuild?.conflictStatus?.find(x=>x.zoneStatus?.zoneId === zoneId)
      guild = mapStatus?.territoryWarStatus[0]?.homeGuild?.profile
      if(homeGuild?.zoneStatus?.channelId) zoneChannelId = homeGuild?.zoneStatus?.channelId
    }
    if(conflictStatus && zoneChannelId){
      msg2send.content = `Error getting battles for ${zoneMap[zoneId]?.nameKey}, maybe that zone is not open yet`
      msg2send.components = buttons
      squads = await getSquads(conflictStatus)
    }
    if(squads?.length > 0){
      msg2send.content = `Error getting battle log for ${zoneMap[zoneId]?.nameKey}`
      msg2send.components = buttons
      battleLog = await getChannelLogs(obj, dObj, loginConfirm, zoneChannelId)
      if(battleLog === 'GETTING_CONFIRMATION') return;
      //battleLog = await readFile(`/app/src/cmds/tw/preload/data/logs/${zoneChannelId?.replace(':', '_')}.json`)
    }
    if(battleLog?.event?.length > 0){
      msg2send.content = `Error updaing battle log for ${zoneMap[zoneId]?.nameKey}`
      msg2send.components = buttons
      for(let i in squads) getBattles(battleLog.event, squads[i])
      preload = squads.filter(x=>x.preload === true)
      if(preload?.length == 0) msg2send.content = `I could not find info for preloaded squads in ${zoneMap[zoneId]?.nameKey} it may have been too long since the preload happened.`
    }
    if(preload?.length > 0){
      let embedMsg = {
        color: 15844367,
        title: `${guild.name} preloaded squads for ${zoneMap[zoneId]?.nameKey}`,
        fields: []
      }
      for(let i in preload){
        let leader = unitList[preload[i].leader]?.name
        if(!leader) leader = preload[i].leader
        let tempObj = {
          name: `${preload[i].playerName} ${leader} squad (${preload[i].battleCount})`,
          value: `Battle Log :\n`
        }
        if(preload[i].log.length === 0) tempObj.value += 'I was not able to determine the battle log for this squad\n'
        if(preload[i].log?.filter(x=>x.playerPreloaded).length === 0) tempObj.value += 'I was not able to determine who preloaded this squad\n'
        for(let p in preload[i].log){
          let battleOutcome = squadStatusMap[preload[i].log[p]?.squadStatus]
          if(!battleOutcome) battleOutcome = 'Unknown'
          tempObj.value += `${preload[i].log[p].battleNum?.toString()?.padStart(2, 0)} ${preload[i].log[p].playerName} `
          if(preload[i].log[p]?.squadStatus === 'UNKNOWN'){
            tempObj.value += '- Unknown\n'
          }else{
            tempObj.value += ` (${preload[i].log[p]?.finishUnits}/${preload[i].log[p]?.startUnits}) - ${preload[i].log[p]?.playerPreloaded ? 'Preloaded':battleOutcome}\n`
          }

        }
        embedMsg.fields.push(tempObj)
      }
      msg2send.content = null
      msg2send.embeds = [embedMsg]
      msg2send.components = buttons
    }
    await HP.ButtonPick(obj, msg2send, method)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
