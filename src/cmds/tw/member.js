'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, loginConfirm, gObj, sendResponse = 0, member, joined, memberJoined, memberNotJoined
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
      sendResponse++
      msg2send.content = 'There is not a TW in progress'
      if(gObj?.data?.guild?.member?.length > 0) member = await gObj?.data?.guild?.member.filter(x=>x.memberLevel !== 1).map(x=>{
        return {
          playerId: x.playerId,
          name: x.playerName
        }
      })
      if(member?.length > 0) member = await sorter([{column: 'name', order: 'ascending'}], member)
      if(gObj?.data?.guild?.territoryWarStatus?.length > 0){
        msg2send.content = 'No one has joined TW yet'
        if(gObj.data.guild.territoryWarStatus[0].optedInMember.length > 0) joined = await gObj?.data?.guild?.territoryWarStatus[0].optedInMember.map(x=>x.memberId)
      }
    }
    if(member?.length > 0 && joined?.length > 0){
      if(joined.length === member.length){
        msg2send.content = 'All members have joined'
      }else{
        msg2send.content = 'Error figuring it out'
        memberJoined = member.filter(x=>joined.includes(x.playerId))
        memberNotJoined = member.filter(x=>!joined.includes(x.playerId))
      }
    }
    if(memberJoined?.length > 0 || memberNotJoined?.length > 0){
      msg2send.embeds = []
      msg2send.content = null
      msg2send.componets = null
      if(memberJoined?.length > 0){
        const joinEmbed = {
          color: 15844367,
          title: gObj.data.guild.profile?.name+' players joined ('+memberJoined.length+')',
          description: '```\n'
        }
        for(let i in memberJoined) joinEmbed.description += memberJoined[i].name+'\n'
        joinEmbed.description += '```'
        msg2send.embeds.push(joinEmbed)
      }
      if(memberNotJoined?.length > 0){
        const notJoinEmbed = {
          color: 15844367,
          title: gObj.data.guild.profile?.name+' players not joined ('+memberNotJoined.length+')',
          description: '```\n'
        }
        for(let i in memberNotJoined) notJoinEmbed.description += memberNotJoined[i].name+'\n'
        notJoinEmbed.description += '```'
        msg2send.embeds.push(notJoinEmbed)
      }
    }
    if(sendResponse) HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
    HP.ReplyError(obj)
  }
}
