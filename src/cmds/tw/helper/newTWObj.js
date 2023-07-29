'use strict'
const enumTW = require('./enumTWZones')
const CalcPerfectScore = (maxSquads)=>{
  const maxDefense = ( ( enumTW.scores.p1.perCharDefSet * maxSquads ) * 8) + ( ( enumTW.scores.p1.perShipDefSet * maxSquads ) * 2)
  const maxClear = ( ( enumTW.scores.p1.clearPerSquadBonus * maxSquads ) * 10) + (enumTW.scores.p1.clearBonus * 7) + (enumTW.scores.p4.clearBonus * 3)
  const maxOffense = ( ( enumTW.scores.p1.perCharSquadMax * maxSquads ) * 8) + ( ( enumTW.scores.p1.perShipSquadMax * maxSquads ) * 2)
  return ( maxDefense + maxClear + maxOffense )
}
module.exports = (guildData)=>{
  const tempObj = {
    homeGuild: guildData.homeGuild.conflictStatus,
    awayGuild: guildData.awayGuild.conflictStatus,
    banners: {
      perfectScore: CalcPerfectScore(guildData.homeGuild.conflictStatus[0].squadCapacity),
      home: {
        perfectScore: CalcPerfectScore(guildData.homeGuild.conflictStatus[0].squadCapacity),
        name: guildData.homeGuild.profile.name,
        guildId: guildData.homeGuild.profile.id,
        gp: numeral(parseInt(guildData.homeGuild.profile.guildGalacticPower)).format("0,0"),
        finalScore: 0,
        defeatedChar: 0,
        defeatedShips: 0,
        defeatedTotal: 0,
        bestScore: 0,
        clear: 1,
      },
      away: {
        perfectScore: CalcPerfectScore(guildData.awayGuild.conflictStatus[0].squadCapacity),
        name: guildData.awayGuild.profile.name,
        guildId: guildData.awayGuild.profile.id,
        gp: numeral(parseInt(guildData.awayGuild.profile.guildGalacticPower)).format("0,0"),
        finalScore: 0,
        defeatedChar: 0,
        defeatedShips: 0,
        defeatedTotal: 0,
        bestScore: 0,
        clear: 1,
      }
    },
    leaders: {
      home: [],
      away: []
    },
    defends: {
      home: {
        name: [],
        defends: 0
      },
      away: {
        name: [],
        defends: 0
      }
    },
    drops: {
      home:{
        charDrops: 0,
        charBannerDrops: 0,
        shipDrops: 0,
        shipBannerDrops: 0,
        charNotSet: 0,
        shipNotSet: 0
      },
      away: {
        charDrops: 0,
        charBannerDrops: 0,
        shipDrops: 0,
        shipBannerDrops: 0,
        charNotSet: 0,
        shipNotSet: 0
      }
    },
    zoneData: {
      home: {
        clear: 1,
        data: []
      },
      away: {
        clear: 1,
        data:[]
      }
    }
  }
  return (JSON.parse(JSON.stringify(tempObj)))
}
