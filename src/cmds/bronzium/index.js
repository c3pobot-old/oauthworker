'use strict'
const FormatItems = require('./formatItems')
module.exports = async(obj = {})=>{
  try{
    let qty = 100, loginConfirm, msg2send = {content: 'You do not have google or fb linked'}, opt = [], identity, pObj, tObj, socialTotal = 0, timeNow = Date.now()
    if(obj?.data?.options) opt = obj.data.options
    if(obj?.confirm){
      await HP.ReplyButton(obj, null)
      if(obj.confirm?.qty){
        qty = obj.confirm.qty
      }else{
        qty = await HP.GetOptValue(opt, 'quantity')
      }
      if(obj.confirm?.timeNow) timeNow = +obj.confirm.timeNow
    }else{
      qty = await HP.GetOptValue(opt, 'quantity')
    }
    if(!qty || qty > 100) qty = 100
    qty = +qty
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.uId && dObj.type){
      await HP.ReplyButton(obj, 'Pulling data ...')
      msg2send.content = 'Error getting data'
      pObj = await Client.oauth(obj, 'getInitialData', dObj, {}, loginConfirm)
      if(pObj?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj.allyCode)
        return;
      }
    }
    if(pObj?.data?.inventory?.currencyItem){
      msg2send.content = 'You do not have enough allypoints'
      socialTotal = pObj.data.inventory.currencyItem.find(x=>x.currency == 4)?.quantity
      if(socialTotal) socialTotal = +socialTotal
    }
    if(socialTotal){
      const spendRequest = qty * 250
      if(spendRequest > socialTotal) qty = Math.floor(socialTotal / 250)
      msg2send.content = 'Error opening bronzium packs'
      tObj = await Client.oauth(obj, 'buyItem', dObj, {itemId: 'premium-pack-silver', paymentCurrency: 4, quantity: qty}, loginConfirm)
      //tObj = (await mongo.find('tempData', {_id: 'bronzium-100'}))[0]
    }
    if(tObj?.data?.purchasedResult?.length > 0){
      //await mongo.set('tempData', {_id: 'bronzium-100'}, tObj)
      const data = await FormatItems(tObj.data.purchasedResult)
      if(data && data.spent){
        //await mongo.set('tempData', {_id: 'packData'}, data)
        const embedMsg = {
          color: 15844367,
          title: 'Bronzium packs ('+data.spent / 250+') Ally points ('+numeral(data.spent).format('0,0')+')',
          description: 'Remaining Ally Points : `'+numeral(socialTotal - data.spent).format('0,0')+'`\n\n'
        }
        if(data.td){
          embedMsg.description += '**Training Droids** : `'+data.td+'`\n'
        }
        if(data.credits){
          embedMsg.description += '**Credits** : `'+data.credits+'`\n'
        }
        if(data.shards){
          embedMsg.description += '**Shards** : `'+data.shards+'`\n'
        }
        if(data.gear){
          embedMsg.description += '**Total Gear** : `'+data.gear+'`\n'
        }
        if(data.sgear){
          embedMsg.description += '**Possible Scavanger Scrap** : \n'
          for(let i in data.sgear){
            const scrapCount = Math.floor(data.sgear[i].value / +data.sgear[i].pointValue)
            if(scrapCount > 0) embedMsg.description += '`'+(scrapCount).toString().padStart(2, '0')+'` '+(data.sgear[i].nameKey ? data.sgear[i].nameKey:data.sgear[i].id)+'\n'
          }
        }
        if(data.specGear){
          embedMsg.description += '**Special Gear** : \n'
          for(let i in data.specGear) embedMsg.description += '`'+data.specGear[i].total.toString().padStart(2, '0')+'` '+(data.specGear[i].nameKey ? data.specGear[i].nameKey:data.specGear[i].id)+'\n'
        }
        if(data.unit){
          embedMsg.description += '**Units**\n'
          for(let i in data.unit) embedMsg.description += '`'+data.unit[i].total.toString().padStart(2, '0')+'`'+' '+(data.unit[i].nameKey ? data.unit[i].nameKey:data.unit[i].id)+'\n'
        }
        msg2send.embeds = [embedMsg]
        msg2send.content = null
        if((+(Date.now()) - timeNow) < 480000){
          await redis.setTTL('button-'+obj.id, JSON.parse(JSON.stringify(obj)), 600)
          msg2send.components = [{ type:1, components: []}]
          msg2send.components[0].components.push({
            type: 2,
            label: 'Pull '+qty+' again',
            style: 3,
            custom_id: JSON.stringify({id: obj.id, qty: qty, timeNow: +timeNow})
          })
          if(qty < 100){
            msg2send.components[0].components.push({
              type: 2,
              label: 'Pull 100',
              style: 3,
              custom_id: JSON.stringify({id: obj.id, qty: 100, timeNow: +timeNow})
            })
          }
        }
      }
    }
    if(obj.confirm){
      await HP.RemoveJob(obj.id)
      MSG.WebHookMsg(obj.token, msg2send, 'POST')
    }else{
      HP.ReplyMsg(obj, msg2send)
    }
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
