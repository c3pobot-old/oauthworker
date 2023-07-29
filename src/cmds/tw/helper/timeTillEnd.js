'use strict'
module.exports = (time) =>{
  let timeNow = (new Date()).getTime()
  if(timeNow < parseInt(time)){
    let delta = Math.abs(parseInt(time) - timeNow) / 1000
    let hours = Math.floor(delta / 3600)
    delta -= hours * 3600
    let minutes = Math.floor(delta / 60)
    delta -= minutes * 60
    let seconds = Math.floor(delta)
    return({
      h: hours > 9 ? hours.toString() : ('0'+hours).toString(),
      m: minutes > 9 ? minutes.toString() : ('0'+minutes).toString(),
      s: seconds > 9 ? seconds.toString() : ('0'+seconds).toString()
    })
  }else{
    return({
      h: '00',
      m: '00',
      s: '00'
    })
  }
}
