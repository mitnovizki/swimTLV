
//@TODO
//https://www.youtube.com/watch?v=5u7EhBt28ek&t=7097s

const readPdf = require('../helpers/find-links-in-pdf').handler
const fs = require('fs');
var promises = []
var pdf = new readPdf()
const path = require('path')
var baseDir = path.join(__dirname, '../.data')

function authController(linkToPdf) {

  //@TODO: implement linkToPDF - optional
  function getLinksFromPDF(req, res) {

    fs.readFile(baseDir + '/javascript' + '.pdf', 'utf-8', (err, pdfData) => {

      //console.log(pdfData)
      if (err) { console.log('Oops:', err); }
      else {
        promises.push(promiseToGetLinksFromPDF(pdfData));
        //console.log(`promiseResult${promiseResult}`)
      }
    })
    Promise.all(promises).then(console.log('RESOLVED'))
  }

  function promiseToGetLinksFromPDF(data) {
    //console.log(data)
    return new Promise((resolve, rejects) => {
      pdf.process(data)
      resolve('ok')
    })
  }
  return { getLinksFromPDF }
}
module.exports = authController