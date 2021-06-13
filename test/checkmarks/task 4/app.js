const express = require('express')
const app = express()

const languages= {
    'javascript':1,
    'c#':2,
    'c++':3,
    'perl':4
}
const badKeyWordsJavascript = [
    'static',
    'ecstatic',
    'fantastic'
]
const badKeyWordsJava = [
    'script',
    'var',
    'stat'
]
const keyWordByLanguage = {
    "javascript": badKeyWordsJavascript,
    "java":badKeyWordsJava
}

app.get('/test',(req,res)=>{
    res.send('Test the app')
})

app.get('/test/:language/:code',(req, res)=>{
    let code = req.params.code
    let language = req.params.language
    
    function findLanguage(language)
    {
        return languages[language]
    }
    
    function checkKeyWords(keyWords, code)
    {
        keyWords.forEach(word => {
          if(code.seach(word)){
              return 'exists'
          }
        });
    }

    let result = findLanguage(language)

    if(result)
    {
        let checkCode = checkKeyWords(keyWordByLanguage[language],code)
        if(checkCode === 'exists')
        {
            res
            .status(400)
            .send('Bed Request')
        }
        res
        .status(200)
        .send('code was analyzed')
    }
    else
    {
        res
        .status(400)
        .send('Bed Request, languagae not found')
    }
    res.send('test')
})

app.listen(3000, ()=>{
    console.log('test: server is listening on port 3000')
})