

//1
// function MyException(message) {
//   this.message = message
//   this.name = 'My Exception'
//   this.toString = function () { return `${this.name}:${this.message}` }
// }

// // const exception = new MyException('Hi')
// // console.log(exception)

// throw new MyException('wrong data, try again!')



//2
function checkIfXXX(data) {
  if (typeof (data) === 'string') {
    this.value = data
    this.getValue = function () {
      console.log(this.value + 'is string')
    }
  }
  else if (typeof data === 'boolean') {
    throw 'Error!!!'
  }
  else {
    throw new StringExceptionError(data)
  }
}

function StringExceptionError(data) {
  this.value = data
  this.message = `${this.value} is not a string!`
  this.toString = function () {
    return this.message
  }
}

// function verifyData(data) {
//   let checkResponse
//   try {
//     checkResponse = new checkIfXXX(data)
//   } catch (e) {
//     if (e instanceof StringExceptionError) {
//       console.log(`${data} is not a string! `)
//     }
//     else {
//       console.log('some other error. drama in da house')
//     }
//     return ":("
//   }
//   finally {
//     console.log('I am finally function, just so you know...and I run before cache return statement muahahahaha')

//   }
//   //finally { console.log('I am finally func') }
//   return checkResponse
// }

// const a = verifyData("blablablaaaa    ")
// a.getValue()
// const b = verifyData(12321)
// const c = verifyData(true)
// console.log(verifyData(123))


//3
function reverseJsonArray(jsonArr) {

  let arr
  try {
    arr = JSON.parse(jsonArr)
    if (arr.length < 2) { throw new Error }

    if (typeof (arr) !== 'object') { throw new Error }
    let reversed = Array.prototype.reverse.call(arr)



    arr = JSON.stringify(reversed)

    return arr

  } catch (error) {
    arr = false
  }
  finally {
    return arr
  }
}


console.log(reverseJsonArray('["a","b","c"]'))
console.log(reverseJsonArray(123))
console.log(reverseJsonArray('["a","b","c]'))
console.log(reverseJsonArray(['a', 'b', 'c']))
console.log(true)
console.log(reverseJsonArray('["a"]'))
console.log(reverseJsonArray('["a","b"]'))
console.log(reverseJsonArray('["a","b","c","d"]'))
console.log(reverseJsonArray('[]'))
console.log(reverseJsonArray())