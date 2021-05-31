
/**
 * 
 * @param {6} n 

  1 1
  2 1
  1 2 1 1
  1 1 1 2 2 1
  3 1 2 2 1 1
 */
function countAndSay(n) {

  let sequence = [1, 1]
  let typeCount = 0
  let currentType = 1
  let result = []

  while (n > 0) {
    console.log(...sequence)

    sequence.forEach(el => {
      if (el == currentType) {
        typeCount++
      }
      else {
        result.push(typeCount)
        result.push(currentType)
        currentType = el
        typeCount = 1
      }
    })

    result.push(typeCount)
    result.push(currentType)

    sequence = [...result]
    currentType = sequence[0]
    result = []
    typeCount = 0
    n -= 1
  }
}

//with strings
function countAndSay_2(n) {

  let seq = ['1', '1']
  let count = 0
  let type = '1'
  let result = ''


  while (n > 0) {

    console.log(...seq)

    seq.forEach(el => {
      if (el == type) {
        count++
      }
      else {
        result = result.concat(count)
        result = result.concat(type)

        type = el
        count = 1
      }
    })

    result = result.concat(count)
    result = result.concat(type)
    seq = [...result]


    type = seq[0]
    result = ''
    count = 0
    n -= 1
  }
}

countAndSay(5)
//countAndSay_2(5)
//strings()

