'use strict'
module.exports = async(gObj, eObj)=>{
  try{
    let gWin = 0, gLoss = 0, eWin = 0, eLoss = 0, gLast = {status: 'W', time: 0}, eLast = {status: 'W', time: 0}
    if(gObj){
      for(let i in gObj){
        if(+gObj[i].score > +gObj[i].opponentScore){
          gWin++
          if(+gObj[i].endTimeSeconds > gLast.time){
            gLast.time = +gObj[i].endTimeSeconds
            gLast.status = 'W'
          }
        }else{
          gLoss++
          if(+gObj[i].endTimeSeconds > gLast.time){
            gLast.time = +gObj[i].endTimeSeconds
            gLast.status = 'L'
          }
        }
      }
    }
    if(eObj){
      for(let i in eObj){
        if(+eObj[i].score > +eObj[i].opponentScore){
          eWin++
          if(+eObj[i].endTimeSeconds > eLast.time){
            eLast.time = +eObj[i].endTimeSeconds
            eLast.status = 'W'
          }
        }else{
          eLoss++
          if(+eObj[i].endTimeSeconds > eLast.time){
            eLast.time = +eObj[i].endTimeSeconds
            eLast.status = 'L'
          }
        }
      }
    }
    const obj = {
      name: 'TW Record',
      value: '```autohotkey\n'
    }
    obj.value += 'Record : '
    obj.value += gWin+'-'+gLoss
    if(eObj) obj.value += ' vs '+eWin+'-'+eLoss
    obj.value += '\nLast   : '+gLast.status.padStart(3, ' ')
    if(eObj) obj.value += ' vs '+eLast.status
    obj.value += '\n```'
    return obj
  }catch(e){
    console.error(e)
  }
}
