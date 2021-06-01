const express = require('express')
const app = express()
const mysql = require('mysql')
const siege = require('siege')
const connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mysql',
  })

connection.connect((err) => {
  if (err) {
    console.error(err)
    return
  }
  console.log('Connected to my DB')
})

//rout + controller just for test

//without connection
app.get('/', (req, res) => {

  connection.query('select user from user', (err, rows) => {
    if (err) {
      console.error(err)
      return
    }

    console.table(rows)
    //return rows
    connection.end
    res.send(rows)

  })

})

app.listen(9991, () => {
  console.info('app is listening :)')
  siege()
    .on(9991)
    .for(100000).times
    .get('/')
    .attack()
})