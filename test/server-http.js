
const http = require('http')
const server = http.createServer()

setTimeout(() => {
  console.log('hi')
}, 5000);


//#region  using built in http libraries
server.on('listening', () => { console.log('server is listening on port 7000') })

//request  is an event 
server.on('request', (req, res) => {
  console.log(req.url)

  if (req.url == '/favicon.ico') {
    res.write('attention: favicon requested')
    res.end()
  }
  else {
    setTimeout(() => {
      res.write('Hel-llll-loooo')
      res.end()
    }, 7000);

  }
})
server.listen(7000)
//#endregion  using built in http libraries
