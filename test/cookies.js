const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')

//middleware: use and call it()
app.use(cookieParser())
app.get('/', (req, res) => {

  //cookies now stored in browser [inspect application]
  // res.cookie('sky', 'blue')
  // res.cookie('grass', 'green')

  console.log(req.cookies)
  res.send('Hello')
})

app.listen(9000, () => { console.log('server is listening on port 9000!') })