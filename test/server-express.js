const express = require('express')

const server = express()

server.listen((3030), () => { console.log('server listening on port 3030') })

server.get('/', (req, res) => {
  res.send('hello from get')
  console.log('get is called')
})

server.get('/favicon', (req, res) => {
  res.sendFile('./favicon.ico')
  console.log('get favicon is called')
})

server.post('/', (req, res) => {
  // req.params([1, 2, 3, 3, 3])
  res.send('hello from post')
  console.log('get is called')
})