'use strict'
const Cmds = {}
const enumTD = {
  'xp-mat-one-star': 'T1 Training Droid',
  'xp-mat-two-star': 'T2 Training Droid',
  'xp-mat-three-star': 'T3 Training Droid',
  'xp-mat-four-star': 'T4 Training Droid',
  'xp-mat-five-star': 'T5 Training Droid',
  'xp-mat-six-star': 'T6 Training Droid',
  'xp-mat-seven-star': 'T7 Training Droid'
}
const specGear = ['102', '108']

Cmds.currencyItem = (obj = [], res = {})=>{
  try{
    for(let i in obj){
      if(!res.credits) res.credits = 0
      res.credits += obj[i].quantity || 0
      res.credits += obj[i].bonusQuantity || 0
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.material = (obj = [], res = {})=>{
  try{
    for(let i in obj){
      if(obj[i].id){
        if(obj[i].id.startsWith('unitshard_')){
          if(!res.shards) res.shards = 0
          res.shards += obj[i].quantity || 0
          res.shards += obj[i].bonusQuantity || 0
        }else{
          if(!res.td) res.td = 0
          if(enumTD[obj[i].id]){
            res.td += obj[i].quantity || 0
            res.td += obj[i].bonusQuantity || 0
          }
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.unit = (obj = [], res = {})=>{
  try{
    for(let i in obj){
      if(!res.unit) res.unit = {}
      if(!res.unit[obj[i].id]) res.unit[obj[i].id] = {id: obj[i].id.split(':')[0], total: 0}
      if(res.unit[obj[i].id]){
        res.unit[obj[i].id].total += 1
        if(!res.unit[obj[i].id].nameKey){
          if(unitList[obj[i].id.split(':')[0]]) res.unit[obj[i].id].nameKey = unitList[obj[i].id.split(':')[0]].name
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
Cmds.equipment = async(obj = [], res = {})=>{
  try{
    const sgear = await mongo.find('scavengerGear', {})
    for(let i in obj){
      if(!res.gear) res.gear = 0
      res.gear += obj[i].quantity || 0
      res.gear += obj[i].bonusQuantity || 0
      if(specGear.filter(x=>x == obj[i].id).length > 0){
        if(!res.specGear) res.specGear = {}
        if(!res.specGear[obj[i].id]) res.specGear[obj[i].id] = {id: obj[i].id, total: 0}
        if(res.specGear[obj[i].id]){
          res.specGear[obj[i].id].total += obj[i].quantity || 0
          res.specGear[obj[i].id].total += obj[i].bonusQuantity || 0
          if(!res.specGear[obj[i].id].nameKey){
            const tempGear = (await mongo.find('equipment', {_id: obj[i].id}))[0]
            if(tempGear && tempGear.nameKey) res.specGear[obj[i].id].nameKey = tempGear.nameKey
          }
        }
      }
      for(let x in sgear){
        if(sgear[x].gear.find(x=>x.id == obj[i].id)){
          if(!res.sgear) res.sgear = {}
          if(!res.sgear[sgear[x].id]) res.sgear[sgear[x].id] = {id: sgear[x].id, pointValue: sgear[x].pointValue, nameKey: sgear[x].nameKey, gear: {}, total: 0, value: 0}
          if(res.sgear[sgear[x].id]){
            if(!res.sgear[sgear[x].id].gear[obj[i].id]) res.sgear[sgear[x].id].gear[obj[i].id] = 0
            res.sgear[sgear[x].id].total += obj[i].quantity || 0
            res.sgear[sgear[x].id].total += obj[i].bonusQuantity || 0
            res.sgear[sgear[x].id].value += (obj[i].quantity * sgear[x].gear.find(x=>x.id == obj[i].id).pointValue) || 0
            res.sgear[sgear[x].id].value += (obj[i].bonusQuantity * sgear[x].gear.find(x=>x.id == obj[i].id).pointValue) || 0
            res.sgear[sgear[x].id].gear[obj[i].id] += obj[i].quantity || 0
            res.sgear[sgear[x].id].gear[obj[i].id] += obj[i].bonusQuantity || 0
          }
        }
      }
    }
  }catch(e){
    console.error(e)
  }
}
module.exports = async(obj)=>{
  try{
    let res = {spent: 0}, count = 0
    for(let i in obj){
      if(obj[i].credit){
        for(let c in obj[i].credit){
          if(obj[i].credit[c].length > 0 && Cmds[c]) await Cmds[c](obj[i].credit[c], res)
        }
      }
      if(obj[i].debit && obj[i].debit.currencyItem && obj[i].debit.currencyItem.find(x=>x.currency == 4)) res.spent += +(obj[i].debit.currencyItem.find(x=>x.currency == 4).quantity || 0)
    }
    if(res.spent || count) return res
  }catch(e){
    console.error(e)
  }
}
