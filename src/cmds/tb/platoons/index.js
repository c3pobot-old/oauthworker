'use strict'
const GetHTML = require('webimg').tbPlatoons
const BasicMap = require('./basicMap')
const SavedMap = require('./savedMap')
const GetPlatoonConfig = async(guildId, tbId)=>{
  try{
    const obj = (await mongo.find('tbPlatoonConfig', {_id: guildId}))[0]
    if(obj && obj[tbId]) return obj[tbId].data
  }catch(e){
    console.error(e);
  }
}
module.exports = async(obj ={}, opt = [])=>{
  try{
    let msg2send = { content: 'The platoon info is not in the database yet' }, guildId, guild, guildName, dObj, units = {}, platoons = [], webData, webImg, pConfig, tbDay
    if(obj.confirm?.tbDay){
      tbDay = obj.confirm.tbDay
      await HP.ReplyButton(obj)
    }
    let tbId = await HP.GetOptValue(opt, 'tb-name', 't05D')
    const pDef = (await mongo.find('tbPlatoons', {_id: tbId}))[0]
    if(pDef?.platoons?.length > 0){
      msg2send.content = 'Your allyCode is not linked to discordId'
      dObj = await HP.GetDiscordAC(obj.member?.user?.id, opt)
    }
    if(dObj?.allyCode){
      msg2send.content = 'Error getting guild'
      const gObj = await HP.GetGuildId(dObj, {allyCode: dObj.allyCode}, opt)
      if(gObj?.guildId){
        guildId = gObj.guildId
        guild = await Client.post('fetchGuild', {id: gObj.guildId, projection: {name: 1, playerId: 1, allyCode: 1, guildName: 1, rosterUnit: {sort: 1, definitionId: 1, currentLevel: 1, currentRarity: 1, currentTier: 1, relic: 1, gp: 1, combatType: 1}}})
      }
    }
    if(guildId){
      pConfig = await GetPlatoonConfig(guildId, tbId)
    }
    if(guild?.member?.length > 0 && pConfig?.length > 0 && !tbDay){
      const embedMsg = {
        content: 'You guild has platoon config saved do you want to use one of these?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in pConfig){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: 'Round-'+pConfig[i].round,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, tbDay: +pConfig[i].round})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, tbDay: 'none'})
      })
      await HP.ButtonPick(obj, embedMsg)
      return
    }
    if(guild?.member?.length > 0){
      msg2send.content = 'Error Calculating data'
      let data
      if(pConfig?.length > 0 && tbDay && tbDay !== 'none'){
        const tempData = (await mongo.find('tbPlatoonCache', {_id: guild?.id+'-'+tbDay+'-'+tbId}))[0]
        if(tempData?.platoons) data = tempData
        if(!data){
          data = await SavedMap(guild.member, pDef.platoons, pConfig.find(x=>x.id === 'tbPlatoonIds-'+tbDay+'-'+tbId)?.data, tbDay)
          await mongo.set('tbPlatoonCache', {_id: guild?.id+'-'+tbDay+'-'+tbId}, {platoons: data?.platoons, tbId: tbId, guildId: guild.id, tbDay: tbDay})
        }

      }else{
        data = await BasicMap(guild.member, pDef, opt)
      }
      if(data?.content) msg2send.content = data.content
      if(data?.platoons) platoons = data.platoons
    }
    if(platoons?.length > 0){
      msg2send.content = 'Error getting HTML'
      //await mongo.set('webTemp', {_id: 'platoons'}, {data: platoons, info: {nameKey: pDef.nameKey, guild: guild.name}})
      webData = await GetHTML(platoons, {nameKey: pDef.nameKey, guild: guild.name})
    }
    if(webData){
      msg2send.content = 'Error getting image'
      webImg = await HP.GetImg(webData, obj.id, 900, false)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'platoons.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
