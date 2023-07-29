'use strict'
const GetHTML = require('webimg').conquest
const CheckFeats = require('./checkFeats')
const CheckBattles = require('./checkBattles')
const GetRewards = require('./getRewards')
const enumDiff = {
  8: 'I_DIFF',
  9: 'II_DIFF',
  10: 'III_DIFF'
}
module.exports = async(obj = {}, opt = [], pObj ={})=>{
  try{
    let featHtml, featImg, msg2send = {content: 'Error getting feat info'}
    const eventDetails = pObj?.gameEvent?.find(x=>x.conquestId == pObj?.conquestStatus?.conquestDefinitionIdentifier)
    const eventInstanceId = pObj?.conquestStatus?.conquestEventIdentifier
    const res = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated,
      totalKeys: 0,
      feats: [],
      stars: [],
      credits: 0,
      keys: 0,
      featType: 1
    }
    if(pObj.challengeProgress){
      const featChallenges = pObj.challengeProgress.filter(x=>x.eventInstanceId === eventInstanceId && x.campaignElementId.startsWith('CONQUEST:'+pObj.conquestStatus.conquestDefinitionIdentifier+':'+enumDiff[pObj.conquestStatus.difficultyType]))
      if(featChallenges.filter(x=>x.id?.includes('S0')).length > 0) res.featType = 0
      const tempFeats = await CheckFeats(featChallenges, res.featType);
      if(tempFeats?.complete >= 0){
        res.totalKeys += tempFeats.complete + (tempFeats?.incomplete || 0)
        res.keys += tempFeats.complete
        if(tempFeats.missing?.length > 0) res.feats = tempFeats.missing
      }
    }
    if(pObj.conquestStatus?.nodeStatus){
      const tempStatus = await CheckBattles(pObj.conquestStatus.nodeStatus, pObj.conquestStatus.nodeSelection, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)
      if(tempStatus?.complete >= 0){
        res.keys += tempStatus.complete
        res.totalKeys += tempStatus.total
        if(tempStatus.battles?.length > 0) res.stars = tempStatus.battles
      }
    }
    if(pObj.inventory) res.credits = +(pObj.inventory.find(x=>x.currency == 39).quantity || 0)
    if(res.keys > 0) res.rewards = await GetRewards(+res.keys, pObj.conquestStatus.difficultyType, pObj.conquestStatus.conquestDefinitionIdentifier)
    if(res.totalKeys){
      msg2send.content = 'error getting feat HTML'
      featHtml = await GetHTML.feat(res)
    }
    if(featHtml){
      msg2send.content = 'error getting feat image'
      featImg = await HP.GetImg(featHtml, obj.id, 680, false)
    }
    if(featImg){
      msg2send.content = null,
      msg2send.file = featImg
      msg2send.fileName = 'conquest-feat.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
