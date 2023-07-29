'use strict'
const { GetMissingGP } = require('./helper')
const GetData = require('../getData')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'You do not have your google/fb account linked to your discordId'}, gObj
    let tbObj = await GetData(obj, opt)
    if(tbObj?.content) msg2send.content = tbObj.content
    if(tbObj?.data?.guildId){
      msg2send.content = 'error getting data from db'
      gObj = (await mongo.find('tbCache', {_id: tbObj.data.guildId}))[0]
    }
    if(gObj?.currentStat){
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: gObj.name + " Members with possible missing deployment",
        fields: []
      }
      const gpDeployed = gObj.currentStat?.find(x=>x.mapStatId == ('power_round_'+gObj.currentRound))
      let memberCount = 0, missingDeployment = 0
      for(let i in gObj.member){
        const deployedGP = gpDeployed.playerStat.find(x=>x.memberId == gObj.member[i].playerId)
        if(deployedGP && deployedGP.score){
          if(+deployedGP.score < gObj.member[i].gp && gObj.member[i].gp - (+deployedGP.score) > 100000){
            missingDeployment += (gObj.member[i].gp - (+deployedGP.score) || 0)
            if(memberCount < 26) embedMsg.fields.push(await GetMissingGP(gObj.member[i], deployedGP.score))
            memberCount++
          }
        }else{
          missingDeployment += (gObj.member[i].gp || 0)
          if(memberCount < 26) embedMsg.fields.push(await GetMissingGP(gObj.member[i], '0'));
          memberCount++
        }
      }
      if(memberCount == 0){
        embedMsg.fields.push({
          name: 'Deployment Complete',
          value: '```autohotkey\nEveryone deployed\n```'
        })
      }
      embedMsg.description = '```autohotkey\nTotal missing Deployent : '+numeral(missingDeployment).format('0,0')+'\nThere is '+memberCount+' with Deployment issues\n'
      if(memberCount > 25) embedMsg.description += 'Below is 25 of them\n'
      embedMsg.description += '```'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
