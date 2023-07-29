'use strict'
const Cmds = {}
Cmds.defense = require('./defense')
Cmds.enemy = require('./enemy')
Cmds.omicron = require('./omicron')
Cmds.report = require('./report')
Cmds['report-units'] = HP.ManageReportUnits
Cmds.member = require('./member')
Cmds.status = require('./status')
Cmds.stats = require('./stats')
module.exports = async(obj)=>{
  try{
    let tempCmd, opt = []
    if(obj.data.options){
      for(let i in obj.data.options){
        if(Cmds[obj.data.options[i].name]){
          tempCmd = obj.data.options[i].name
          if(obj.data.options[i].options) opt = obj.data.options[i].options
        }
      }
    }
    if(tempCmd && Cmds[tempCmd]){
      await Cmds[tempCmd](obj, opt)
    }else{
      HP.ReplyMsg(obj, {content: (tempCmd ? '**'+tempCmd+'** command not recongnized':'command not provided')})
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
