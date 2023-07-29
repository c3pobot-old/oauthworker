'use strict'
const MapUnit = require('./mapUnit')
module.exports = async(pObj)=>{
  try{
    let res = []
    if(pObj?.conquestStatus?.unitStamina?.length > 0 && pObj?.unit?.length > 0) res = await Promise.all(pObj.conquestStatus.unitStamina.map(u=> MapUnit(u, pObj.unit.find(x=>x.id == u.unitId))));
    if(res?.length > 0) res = await sorter([{column: 'nameKey', order: 'ascending'}], res)
    return res
  }catch(e){
    console.error(e)
  }
}
