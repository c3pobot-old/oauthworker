'use strict'
const WEBRENDER_URI = process.env.WEBRENDER_URI
const path = require('path')
const fetch = require('node-fetch')
const parseResponse = async(res)=>{
  try{
    if(!res) return
    if(res.status?.toString().startsWith('5')) throw('Bad status code '+res.status)
    if(res.status?.toString().startsWith('2')){
      const arrayBuffer = await res.arrayBuffer()
      return await Buffer.from(arrayBuffer)
    }
  }catch(e){
    throw(e);
  }
}
module.exports = async(html, pKey, width = 80, resizeImg = false)=>{
  try{
    if(!WEBRENDER_URI) return
    let payload = { method: 'POST', compress: true, timeout: 60000, headers: {'Content-Type': 'application/json'}}
    let body = { html: html, width: width, resizeImg: resizeImg}
    if(pKey) body.pKey = pKey
    payload.body = JSON.stringify(body)
    const res = await fetch(path.join(WEBRENDER_URI, 'web'), payload)
    if(res) return await parseResponse(res)
  }catch(e){
    throw(e);
  }
}
