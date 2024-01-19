'use strict'
const rows = [
  {
    index: 0,
    buttons: [
      { nameKey: 'T1', zoneId: 'tw_jakku01_phase01_conflict01' },
      { nameKey: 'T2', zoneId: 'tw_jakku01_phase02_conflict01' },
      { nameKey: 'S1', zoneId: 'tw_jakku01_phase03_conflict01' },
      { nameKey: 'S2', zoneId: 'tw_jakku01_phase04_conflict01' }
    ]
  },
  {
    index: 1,
    buttons: [
      { disabled: true },
      { disabled: true },
      { nameKey: 'M1', zoneId: 'tw_jakku01_phase03_conflict02' },
      { nameKey: 'M2', zoneId: 'tw_jakku01_phase04_conflict02' }
    ]
  },
  {
    index: 2,
    buttons: [
      { nameKey: 'B1', zoneId: 'tw_jakku01_phase01_conflict02' },
      { nameKey: 'B2', zoneId: 'tw_jakku01_phase02_conflict02' },
      { nameKey: 'B3', zoneId: 'tw_jakku01_phase03_conflict03' },
      { nameKey: 'B4', zoneId: 'tw_jakku01_phase04_conflict03' }
    ]
  }
]
module.exports = (obj = {}, loginConfirm)=>{
  try{
    let msgComponents = []
    for(let i in rows){
      let tempObj = {
        type: 1,
        components: []
      }
      for(let b in rows[i].buttons){
        if(rows[i].buttons[b].disabled){
          tempObj.components.push({
            type: 2,
            style: 1,
            label: 'n/a',
            disabled: true,
            custom_id: JSON.stringify({ id: obj.id, zoneId: b})
          })
        }else{
          tempObj.components.push({
            type: 2,
            label: rows[i].buttons[b].nameKey,
            style: 1,
            custom_id: JSON.stringify({ id: obj.id, zoneId: rows[i].buttons[b].zoneId, response: loginConfirm })
          })
        }
      }
      msgComponents[rows[i].index] = tempObj
    }
    return msgComponents
  }catch(e){
    throw(e)
  }
}
