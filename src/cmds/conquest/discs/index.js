'use strict'
const GetHTML = require('webimg').conquest
const FormatEquppiedDiscs = require('./formatEquppiedDiscs')
const FormatUnequippedDiscs = require('./formatUnequippedDiscs')
module.exports = async(obj, opt = [], pObj = {})=>{
  try{
    let discDef = {}, discImg, discHtml, msg2send = {content: 'Error getting disc info'}
    let discOpt = await HP.GetOptValue(opt, 'option', 1)
    const res = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated
    }
    if(discOpt == 1 || discOpt == 2) res.equippedDisc = await FormatEquppiedDiscs(pObj.conquestStatus.equippedArtifact, discDef)
    if(discOpt == 1 || discOpt == 3) res.unequppedDisc = await FormatUnequippedDiscs(pObj.conquestStatus.unequippedArtifact, discDef)
    if(res?.equippedDisc || res.unequppedDisc){
      msg2send.content = 'Error getting disc HTML'
      discHtml = await GetHTML.disc(res)
    }
    if(discHtml){
      msg2send.content = 'Error getting disc image'
      discImg = await HP.GetImg(discHtml, obj.id, 640, false)
    }
    if(discImg){
      msg2send.content = null
      msg2send.file = discImg
      msg2send.fileName = 'conquest-disc.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
