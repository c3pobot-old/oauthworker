'use strict'
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
    let msg2send = {content: "You do not have allyCode linked to discord Id"}, pObj, tbDay, pConfig, pCache
    let tbId = await HP.GetOptValue(opt, 'tb-name', 't05D')
    if(obj.confirm?.tbDay){
      tbDay = obj.confirm.tbDay
      await HP.ReplyButton(obj)
    }
    const allyObj = await HP.GetPlayerAC(obj, opt)
    if(allyObj?.allyCode) pObj = await HP.FetchPlayer({allyCode: allyObj?.allyCode?.toString()})
    if(pObj?.guildId && !tbDay){
      msg2send.content = 'Your guild does not have any platoon info configured'
      pConfig = await GetPlatoonConfig(pObj?.guildId, tbId)
    }
    if(pConfig?.length > 0 && !tbDay){
      const embedMsg = {
        content: 'Please select the round for the platoons you want to see?',
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
    if(tbDay){
      msg2send.content = 'Your guild does not have the platoons cached for Round '+tbDay+'. Run the `/tb platoons` command to cache the data'
      let tempCache = (await mongo.find('tbPlatoonCache', {_id: pObj?.guildId+'-'+tbDay+'-'+tbId}))[0]
      if(tempCache?.platoons) pCache = tempCache.platoons
    }
    if(pCache){
      let count = 0
      const embedMsg = {
        color: 15844367,
        title: pObj.name+' platoons for Round '+tbDay,
        description: ''
      }
      for(let i in pCache){
        if(pCache[i].squads?.length > 0){
          let tempStr
          for(let s in pCache[i].squads){
            let units = pCache[i].squads[s].units?.filter(x=>x.allyCode === pObj.allyCode)
            if(units?.length > 0){
              if(!tempStr) tempStr = pCache[i].id+' '+pCache[i].type+' '+pCache[i].nameKey+'\n'
              tempStr += 'Squad '+pCache[i].squads[s].num+'\n```\n'
              for(let u in units){
                count++;
                tempStr += units[u].nameKey+'\n'
              }
              tempStr += '```\n'
            }
          }
          if(tempStr) embedMsg.description += tempStr
        }
      }
      if(count === 0) embedMsg.description = 'You have no units for these platoons'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
