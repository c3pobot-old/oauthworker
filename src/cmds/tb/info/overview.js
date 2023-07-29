'use strict'
const GetPhase = (zoneId)=>{
  try{
    if(zoneId.includes('_phase01_')) return 'P1'
    if(zoneId.includes('_phase02_')) return 'P2'
    if(zoneId.includes('_phase03_')) return 'P3'
    if(zoneId.includes('_phase04_')) return 'P4'
    if(zoneId.includes('_phase05_')) return 'P5'
    if(zoneId.includes('_phase06_')) return 'P6'
  }catch(e){
    console.error(e);
  }
}
const GetConflict = (zoneId)=>{
  try{
    if(zoneId.includes('_conflict01')) return 'C1'
    if(zoneId.includes('_conflict02')) return 'C2'
    if(zoneId.includes('_conflict03')) return 'C3'
    if(zoneId.includes('_conflict04')) return 'C4'
    if(zoneId.includes('_conflict05')) return 'C5'
    if(zoneId.includes('_conflict06')) return 'C6'
  }catch(e){
    console.error(e);
  }
}
const enumCombatType = {
  0: 'Char/Ship',
  1: 'Char',
  2: 'Ship'
}
module.exports = async(obj = {}, opt = [])=>{
  try{
    let msg2send = { content: 'Error running command' }, tbDef
    let tbId = await HP.GetOptValue(opt, 'tb-name', 't05D')
    if(tbId){
      msg2send.content = 'Error getting tb definition for '+tbId
      tbDef = (await mongo.find('tbDefinition', {_id: tbId}))[0]
    }
    if(tbDef){
      let embedMsg = {
        title: tbDef.nameKey+' phase information',
        fields: []
      }
      for(let i in tbDef.conflictZoneDefinition){
        let tempObj = {
          name: GetPhase(tbDef.conflictZoneDefinition[i].zoneDefinition?.zoneId)+' '+GetConflict(tbDef.conflictZoneDefinition[i].zoneDefinition?.zoneId)+' '+enumCombatType[tbDef.conflictZoneDefinition[i].combatType],
          value: '```\n'
        }
        for(let p in tbDef.conflictZoneDefinition[i].victoryPointRewards){
          tempObj.value += (+p + 1)+'* '+numeral(tbDef.conflictZoneDefinition[i].victoryPointRewards[p].galacticScoreRequirement).format('0,0')+'\n'
        }
        tempObj.value += '```'
        embedMsg.fields.push(tempObj)
      }
      msg2send.embeds = [embedMsg]
      msg2send.content = null
    }
    await HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.error(e);
  }
}
