//@TODO
//https://www.youtube.com/watch?v=5u7EhBt28ek&t=7097s


//test: in browser load http://localhost:8001/
//expected output: pdf file javascript.pdf
const readPdf = require('../find-links-in-pdf').handler

const fs = require('fs');
const server = require('http').createServer();

var promises = []
var pdf = new readPdf()

server.on('request', async (req, res) => {

  if (req.url === '/') {

    // var pdf = new readPdf()
    fs.readFile('../.data/javascript.pdf', (err, data) => {
      if (err) { throw err; }
      else {
        res.end(data);
        console.log(data)
        console.log('res.end data - 222222')
      }
      //!! is being executed. replace with promises
      // promises.push(pdf.process(data))
      promises.push(promiseToGetLinksFromPDF(data))
      console.log('promises.push - 111111')

    });

    Promise.all(promises)

    console.log('after promises')
  }
})

// async function promiseToPrintData(data) {
//   return new Promise((resolve, rejects) => {
//     console.log(data, 'ok')
//     resolve('ok')
//   })
// }

function promiseToGetLinksFromPDF(data) {
  return new Promise((resolve, rejects) => {
    pdf.process(data)
    console.log('inside the promise - 3333333')
  })
  // resolve('ok')
}

server.listen(8001);