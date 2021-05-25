
const arr = [1, [2, 3], [[4, 5], [6], [7, [8, 9]]]]

//recursion and print
function flat(arr) {
  if (Array.isArray(arr)) {
    arr.forEach(a => {
      flat(a)
    });
  }
  else {
    console.log(arr)
  }
}

//reduce and recursion
function flat_2(arr) {

  return arr.reduce((total, acc) => {
    console.log(total)
    console.log('acc:', acc)
    return total.concat(Array.isArray(acc) ? flat_2(acc) : acc)
  }, [])
}
let newArr = flat_2(arr)
console.log('result:' + [...newArr])


//flat(arr)
