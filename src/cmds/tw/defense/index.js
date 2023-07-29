'use strict'
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, guildId, loginConfirm, gObj, sendResponse = 0, twData, defAvailable = [], joined = [], uInfo, memberSet = []
    if(obj.confirm && obj.confirm.response) loginConfirm = obj.confirm.response
    let unit = HP.GetOptValue(opt, 'unit')
    if(unit) unit = unit.toString().trim()
    const dObj = await HP.GetDiscordAC(obj.member.user.id, opt)
    if(dObj && dObj.uId && dObj.type){
      await HP.ReplyButton(obj, 'Pulling guild data ...')
      msg2send.content = 'Error getting guild data'
      const tempGuild = await Client.oauth(obj, 'guild', dObj, {}, loginConfirm)
      if(tempGuild?.error == 'invalid_grant'){
        await HP.ReplyTokenError(obj, dObj.allyCode)
        return;
      }
      if(tempGuild?.data?.guild?.profile?.id) guildId = tempGuild.data.guild.profile.id
      if(tempGuild?.data?.guild?.territoryWarStatus[0]){
        twData = tempGuild.data.guild.territoryWarStatus[0]
      }else{
        if(tempGuild?.data?.guild) msg2send.content = 'There is not a TW in progress'
      }
    }else{
      sendResponse++
    }
    if(guildId === 'nt-4yDG_TPmKUeIqK8SnBw') console.log(guildId)
    if(twData){
      msg2send.content = 'Error getting tw info'
      joined = twData.optedInMember?.map(m =>m.memberId)
      gObj = await Client.post('fetchTWGuild', {token: obj.token, id: guildId, projection: {playerId: 1, name: 1, rosterUnit: {definitionId: 1, currentRarity: 1, currentTier: 1, relic: 1, gp: 1}}})

      if(gObj?.member?.length > 0 && joined?.length > 0 && gObj.member.length > joined.length) gObj.member = gObj.member.filter(x=>joined.includes(x.playerId))
    }
    if(gObj){
      if(unit){
        msg2send.content = 'Error finding unit **'+unit+'**'
        uInfo = await HP.FindUnit(obj, unit, gObj.id)
      }else{
        msg2send.content = 'You did not provide a unit'
      }
    }
    if(uInfo){
      msg2send.content = 'No members have set **'+uInfo.nameKey+'** on defense'
      const twDefense = twData.homeGuild?.conflictStatus
      for(let i in twDefense){
        for(let s in twDefense[i].warSquad){
          if(twDefense[i].warSquad[s]?.squad?.cell?.filter(x=>x.unitDefId.startsWith(uInfo.baseId)).length > 0) memberSet.push(twDefense[i].warSquad[s].playerId)
        }
      }
    }
    if(memberSet?.length > 0){
      msg2send.content = 'All members have **'+uInfo.nameKey+'** have set on defense';
      defAvailable = gObj.member.filter(x=>!memberSet.includes(x.playerId) && x.rosterUnit.filter(u=>u.definitionId.startsWith(uInfo.baseId)).length > 0)
    }
    if(defAvailable?.length > 0){
      defAvailable = await sorter([{column: 'name', order: 'ascending'}], defAvailable)
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(gObj.updated),
        description: 'Total Joined ('+gObj.member.length+')\n```autohotkey\n',
        title: 'TW Guild Defense Available for **'+uInfo.nameKey+'**',
        footer: {
          text: "Data Updated"
        }
      }
      let count = 0
      for(let i in defAvailable){
        const tempUnit = defAvailable[i].rosterUnit?.find(x=>x.definitionId.startsWith(uInfo.baseId))
        if(tempUnit){
          embedMsg.description += (tempUnit.currentRarity || 0)+' : '+numeral(tempUnit.gp || 0).format('0,0').padStart(7, ' ')+' : '+HP.TruncateString(defAvailable[i].name, 12)+'\n'
          count++;
        }
      }
      embedMsg.description += '```'
      embedMsg.title += ' ('+count+')'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e)
    HP.ReplyError(obj)
  }
}
