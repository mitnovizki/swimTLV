const express = require('express')
const app = express()
const mysql = require('mysql')
const siege = require('siege')
const pool = mysql.createPool(
  {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'green',
  })


app.get('/', (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Connected as Id: ', connection.threadId)

    connection.query('select * from employees', (err, rows) => {
      connection.release()
      if (err) {
        console.error(err)
        return
      }
      console.table(rows)
      //return rows
      res.send(rows)
    })

  })


})

app.listen(3000, () => {
  console.info('app is listening :)')
  // siege()
  //   .on(3000)
  //   .for(100000).times
  //   .get('/')
  //   .attack()
})