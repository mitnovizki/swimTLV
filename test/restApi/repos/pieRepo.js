
// let pieRepo={
//     get: function(){
//         return [
//             {"id":1,"name":"apple"},
//             {"id":2,"name":"peach"},
//             {"id":3,"name":"cherry"}
//         ]
//     }
// }
// module.exports = pieRepo
const { rejects } = require('assert')
let fs = require('fs')
const { data } = require('jquery')
const FILE_NAME = './assets/pies.json'

let pieRepo={
    get: function(resolve, rejects){
       fs.readFile(FILE_NAME, function(err, data)
       {
           if(err){
               rejects(err)
            }
            else{
                resolve(JSON.parse(data))
            }
       })
    },
    getById: function(id, resolve, reject)
    {
        fs.readFile(FILE_NAME, function(err, data)
        {
            if(err)
            {
                reject(err)
            }
            else{
                let pie = JSON.parse(data).find(p=>p.id ==id)
                resolve(pie)
            }
        })
    }
}
module.exports = pieRepo