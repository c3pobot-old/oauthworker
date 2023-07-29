'use strict'
module.exports = async(gObj)=>{
  try{
    let lang = (await mongo.find('localeFiles', {_id: 'ENG_US'}, {_id: 0}))[0]
    let tbDef = await mongo.find('tbDefinition', {})
    if(tbDef.length > 0 && lang){
      const tbResults = gObj.guild.territoryBattleResult
      const embedMsg = {
         title: gObj.guild.profile.name + ' last TB Results',
         color: 15844367,
         timestamp: new Date(),
         fields: []
      }
      for (let i in tbResults) {
        const tbInfo = tbDef.find(x=>x.id == tbResults[i].definitionId)
        embedMsg.fields.push({
         name: (lang[tbInfo.nameKey] ? lang[tbInfo.nameKey] : tbInfo.nameKey),
         value: '```\n'+tbResults[i].totalStars+' Stars```'
        })
      }
      lang = null
      tbDef = null
      if(embedMsg.fields.length > 0) return embedMsg
    }
  }catch(e){
    console.log(e)
  }
}
