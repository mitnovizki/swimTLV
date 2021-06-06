function add (number){

    return function addToAbove(addmy)
    {
        return number + addmy
    }

}

let addy = add(10)

console.log(addy(5))


function greet(greet1)
{
    return function(greet2){ return `${greet1} ${greet2}`}
}
let greety = greet('hello,')
console.log(greety('alise'))