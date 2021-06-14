
function pro(){
 new Promise((resolve,reject)=>{
    // throw new Error()
    try {
        for (let index = 0; index < 3; index++) {
            console.log(Date.now())
            resolve('Im from resolve')
            if(index===2)
            {
                throw new Error('Muahahahaha')
            }
        }
    } catch (error) {
         reject()
    }
}).then((data)=>{console.log(data)})
    .catch((data)=>{
        console.log('Im from reject')
    }
)}
//pro()
// pro(()=>{console.log('resolve')})


async function pro1()
{
    let p = []
        for (let index = 0; index < 4; index++) {
        p.push(new Promise((resolve,reject)=>{

            setTimeout(() => {
                console.log('promise all: ' + Date.now())
                resolve(Date.now())
            }, 4000);

        }))
    }
    Promise.all(p).then((values)=>{console.log('RESOLVED: '+values)})
}
pro1()