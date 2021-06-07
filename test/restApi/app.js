
const { json } = require('body-parser')
let express = require('express')
let app = express()
let pieRepo = require('./repos/pieRepo')
//used for end point
let router = express.Router()
// let pies = pieRepo.get()

app.use(express,json())

//get recieves two fucntions: resolve + reject
//next is being called insted of the default next middlewear
router.get('/', (req, res, next)=>{
    pieRepo.get(function(data){
        res.status(200).json({
            "status":200,
            "statusText":"Ok",
            "message": "All pies retrieved",
            "data":data
        })
    }, function(err)
    {
        next(err)//?
    })
  
})

router.get('/:id',(req,res, next)=>{
    pieRepo.getById(req.params.id, function(data){
        if(data)
        { 
            res.status(200).json({
                "status":200,
                "statusText":"Ok",
                "message": "one pie retrieved",
                "data":data
            })
        }
        else
        res.status(404).json({
            "status":400,
            "statusText":"Not Found",
            "message": "The pie not found",
            "error":{
                "code":"NOT_FOUND",
                "message": "The pie was not found"
            }
        })
    }, function(err){
        {next(err)}
    })
})

//configure router, so all routers are prefixed with '/sababa/' lol
app.use('/sababa/', router )

//middlewear for exception handling : err is additional parameter
app.use(function(err, req, res, next){
    res.status(500).json({
    "status":500,
    "statusText":"Inner Server Error",
    "message": err.message,
    "err":{
        "code": "INTERNAL_ERROR",
        "message":err.message
    }    
    })
})

let server = app.listen(5001, ()=>{
    console.log('the app is running on port: 5001')
})
