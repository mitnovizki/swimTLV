

//time
console.log('how long do you take?')
console.time('Timer')
for (let index = 0; index < 10000000; index++) {
}
console.timeEnd('Timer')

//error

console.error('Im error')
console.warn('Im warning')
console.info('Im info')

const people = [
  { name: 'aim', age: 100 },
  { name: 'mark', age: 98 },
  { name: 'lira', age: 101 }
]
console.table(people)