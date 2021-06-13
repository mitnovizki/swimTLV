
function findPermute(str) {

  let permutes = []

  let charArray = Array.from(str)
  // console.log(charArray)

  charArray.forEach(char => {
    console.log(char + ": =>")
    let subForSwap = substring(charArray.indexOf(char))
    console.log("subForSwap: " + subForSwap)
    swap(Array.from(subForSwap), char, 0)

    function substring(skip) {
      let sub = ""
      for (let i = 0; i < charArray.length; i++) {
        if (i != skip) {
          sub = sub + charArray[i]; //a: bc=>{swap: bc, cb} ||  b: ac  || c: ab 
        }
      }
      return sub
    }
    function swap(swapMe, head, i) {
      console.log("swap:" + swapMe)
      if (i < swapMe.length - 1) {
        const curr = swapMe[i];
        const next = swapMe[i + 1]
        swapMe[i] = next
        swapMe[i + 1] = curr
        // console.log("swapMe:" + swapMe.join(''))
        permutes.push(head.concat(swapMe.join('')))

        console.log("permutes:" + permutes)
        i = i + 1
        swap(swapMe, head, i)
      }
    }
  });
}
findPermute("abcd")
//todo: check why doesnt work as expected
