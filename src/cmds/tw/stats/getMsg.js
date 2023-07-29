'use strict'
module.exports = async(data = {})=>{
  try{
    let msg2send = '>>> '
    msg2send += 'Guild : '+data.home?.name+' vs '+data.away?.name+'\n'
    msg2send += 'Score : '+data.homeScore+' vs '+data.awayScore+'\n'
    msg2send += 'Defense GL : '+data.homeGLCount+ ' vs '+data.awayGLCount+'\n'
    msg2send += '----------------------\n'
    msg2send += data.home?.name+' Defense : \n'
    for(let i in data.homeDefense){
      msg2send += data.homeDefense[i]?.nameKey+' : Total : Battles\n'
      for(let s in data.homeDefense[i].squad){
        if(data.homeDefense[i].squad[s]?.battles !== data.homeDefense[i].squad[s].total && data.homeDefense[i].squad[s]?.battles){
          msg2send += data.homeDefense[i].squad[s]?.nameKey+' : '+data.homeDefense[i].squad[s].total+' : '+data.homeDefense[i].squad[s].battles+'\n'
        }
      }
    }
    msg2send += '----------------------\n'
    msg2send += data.away?.name+' Defense : \n'
    for(let i in data.awayDefense){
      msg2send += data.awayDefense[i]?.nameKey+' : Total : Battles\n'
      for(let s in data.awayDefense[i].squad){
        if(data.awayDefense[i].squad[s]?.battles !== data.awayDefense[i].squad[s].total && data.awayDefense[i].squad[s]?.battles){
          msg2send += data.awayDefense[i].squad[s]?.nameKey+' : '+data.awayDefense[i].squad[s].total+' : '+data.awayDefense[i].squad[s].battles+'\n'
        }
      }
    }
    return msg2send
  }catch(e){
    console.error(e);
  }
}
