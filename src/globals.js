'use strict'

global.debugMsg = +process.env.DEBUG || 0
global.botSettings = {}
global.CmdMap = {}
global.gameData = {}
global.gameDataReady = 0
global.gameVersion = ''
global.syncGuilds = []


global.mongo = require('mongoclient')

global.redis = require('redisclient')

global.numeral = require('numeral')
global.Client = require('./client')
global.sorter = require('json-array-sorter')
global.MSG = require('discordmsg')
global.HP = require('./helper')
global.FT = require('./format')
