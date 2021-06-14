
async function A (){
    console.log('Im A')
}

 function B (){
    console.log('Im B')
}

 function C (){
    console.log('Im C')
}

async function D (){
    console.log('Im D')
}

function Start()
{
    let arr = []
    let p = new Promise((resolve, reject)=>{
        await A()
        console.log('Promise 1')
        resolve('A')
    }).then((data)=>{
        console.log(data)
         B()
        
    })

    let p2 = new Promise((resolve, reject)=>{
        await D()
        resolve('D')
    }).then((data)=>
    {
        console.log(data)
    })

arr.push(p, p2)
Promise
    .all(arr)
    .then(()=> C())
}