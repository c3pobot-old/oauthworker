'use strict'
const express = require('express')
const app = express()
app.get('/healthz', (req, res)=>{
  res.json({status: 'ok'}).status(200)
})
app.use('/readyz', (req, res)=>{
  if(gameDataReady){
    res.json({status: 'ok'}).status(200)
  }else{
    res.json({status: 'not ready'}).status(503)
  }
})
const server = app.listen(process.env.HEALTH_PORT || 3001, ()=>{
  console.log('Listening on ', server.address().port)
})
