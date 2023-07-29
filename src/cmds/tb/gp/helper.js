'use strict'
const Cmds = {}
Cmds.GetMissingGP = (member, gpDeployed)=>{
  const tempObj = {
    name: member.name,
    value: "```autohotkey\n"
  }
  tempObj.value += 'Deployed     : '+numeral(gpDeployed).format('0,0')+'\n';
  tempObj.value += 'Not Deployed : '+numeral(member.gp - (+gpDeployed)).format('0,0')+'\n';
  tempObj.value += 'Total        : '+numeral(member.gp).format('0,0')+'\n';
  tempObj.value += 'Char         : '+numeral(member.gpChar).format('0,0')+'\n';
  tempObj.value += 'Ship         : '+numeral(member.gpShip).format('0,0')+'\n';
  tempObj.value += '```'
  return tempObj
}
module.exports = Cmds
