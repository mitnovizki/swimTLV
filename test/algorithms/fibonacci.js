function fib(n, memo) {

  let result

  if (n == 1 || n == 2) {
    result = 1
    return result
  }
  if (memo[n] != null)
    return memo[n]
  else {
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    //  console.log(memo[n])
    return memo[n]
  }
}
let result = fib(8, [])

console.log(result)