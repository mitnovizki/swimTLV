function pow(x, n) //calculate x^n
{
  let y = x
  while (n > 1) {

    y = y * x
    n = n - 1
  }

  return y
}
// console.log(pow(2, 3))
// console.log(pow(2, 3))
// console.log(pow(5, 1))


function pow2(x, n) {
  if (n > 0) {
    n = n - 1
    return x + pow2(x, n)
  }
  return x
}
console.log(pow2(2, 3))
console.log(pow2(2, 4))
