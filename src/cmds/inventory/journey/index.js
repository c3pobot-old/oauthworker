'use strict'
const GetHTML = require('webimg').inventory
module.exports = async(obj = {}, opts = [], pObj = {})=>{
  try{
    let msg2send = { content: 'You did not provide a journey guide to look up'}, guideTemplate, squadData, guideUnits, webData, imgHtml, webImg
    let guideId = await HP.GetOptValue(opts, 'journey')
    let relicRecipe = await mongo.find('recipe', {type: 'relic'})

    if(guideId){
      msg2send.content = 'error finding guide '+guideId
      guideTemplate = (await mongo.find('guideTemplates', {_id: guideId}))[0]
    }
    if(guideTemplate){
      msg2send.content = 'Error getting guide requirements'
      squadData = await HP.CheckGuide(guideTemplate, pObj?.inventory?.unit)
    }
    if(!relicRecipe) msg2send.content = 'Error getting relic info from db'
    if(squadData?.units && relicRecipe?.length > 0){
      if(squadData?.units?.filter(x=>x.notMet && x.combatType === 1).length > 0){
        guideUnits = squadData.units.filter(x=>x.notMet && x.combatType === 1)
      }else{
        msg2send.content = 'All units are at the required gear/relic level for the event'
      }
    }
    if(guideUnits){
      msg2send.content = 'Error Calcuting data'
      let mats = await HP.CheckUnitMats( guideUnits, relicRecipe, pObj?.inventory)
      if(mats){
        webData = {
          material: mats,
          info: {
            player: pObj?.player?.name,
            nameKey: guideTemplate.name,
            updated: Date.now(),
            includeInventory: true
          }
        }
      }
    }
    if(webData){
      msg2send.content = 'error getting HTML'
      imgHtml = await GetHTML.journey(webData)
    }
    if(imgHtml){
      msg2send.content = 'Error getting image'
      webImg = await HP.GetImg(imgHtml, obj.id, 640, false)
    }
    if(webImg){
      msg2send.content = null
      msg2send.file = webImg
      msg2send.fileName = 'journey-guide-gear.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
