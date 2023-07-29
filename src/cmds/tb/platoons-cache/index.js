'use strict'
module.exports = async(obj ={}, opt = [])=>{
  try{
    let msg2send = {content: 'you do not have discord id linked to allyCode'}, pObj, gObj, tbDay
    if(obj.confirm?.tbDay === 'cancel'){
      await HP.ReplyMsg(obj, {content: 'Command canceled', components: null})
      return
    }
    let auth = await HP.CheckGuildAdmin(obj, opt, null)
    if(!auth) msg2send.content = 'This command is only avaliable to guild Admins'
    if(auth){
      msg2send.content = 'Error finding your guild Id'
      pObj = await HP.GetGuildId({dId: obj.member.user.id}, {}, opt)
    }
    if(pObj?.guildId && obj.confirm?.tbDay){
      tbDay = obj.confirm.tbDay
      await HP.ReplyButton(obj)
    }
    if(pObj?.guildId && !tbDay){
      msg2send.content = 'There is no platoon data cached'
      gObj = await mongo.find('tbPlatoonCache', {guildId: pObj.guildId}, {platoons: 0})
    }
    if(gObj?.length > 0){
      const embedMsg = {
        content: 'Please select the round for the platoons you want to clear the cache for?',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i in gObj){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: 'Round-'+gObj[i].tbDay,
          style: 1,
          custom_id: JSON.stringify({id: obj.id, tbDay: +gObj[i].tbDay})
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 1,
        custom_id: JSON.stringify({id: obj.id, tbDay: 'cancel'})
      })
      await HP.ButtonPick(obj, embedMsg)
      return
    }
    if(tbDay){
      msg2send.content = 'tb platoon cache for Round '+tbDay+' has been cleared'
      await mongo.del('tbPlatoonCache', {guildId: pObj.guildId, tbDay: tbDay})
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
