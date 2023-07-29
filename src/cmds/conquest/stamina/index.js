'use strict'
const GetHTML = require('webimg').conquest
const GetUnitStamina = require('./getUnitStamina')
module.exports = async(obj = {}, opt = [], pObj = {})=>{
  try{
    let staminaHtml, staminaImg, msg2send = {content: 'Error getting stamina info'}
    const res = {
      name: pObj.name,
      allyCode: pObj.allyCode,
      guild: pObj.guild,
      updated: pObj?.updated,
      units: []
    }
    res.units = await GetUnitStamina(pObj)
    if(res?.units){
      msg2send.content = 'error getting stamina HTML'
      staminaHtml = await GetHTML.stamina(res)
    }
    if(staminaHtml){
      msg2send.content = 'error getting stamina image'
      staminaImg = await HP.GetImg(staminaHtml, obj.id, 400, false)
    }
    if(staminaImg){
      msg2send.content = null,
      msg2send.file = staminaImg
      msg2send.fileName = 'conquest-stamina.png'
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
