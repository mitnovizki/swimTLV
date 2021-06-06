
/**
 * kyle simpson advances js
 * https://app.pluralsight.com/course-player?clipId=6b35ca9a-9103-414c-af6c-a16ae08da8c3
 * NEW keyword: 1. creates new object 
 * 2. linkes it 
 * 3. set context to the 'this' 
 * 4. returns 'this' so we give the lable to the object 'a1'
 */
function Foo(who)  {
  this.me = who
} 
//create function that has prototype, that links to object that that has 'constructor' arbitrary word 

Foo.prototype.identity = function(){ return('who am i? - ' + this.me)}
Foo.prototype.song = function(){return ('lalalalalal')}
//add property 'identify' directly to object
//Foo.prototype.identity()

//while NEW being used 4 things happen:
//new object gets created
//object gets linked
//context get set to the 'this'
//returns 'this' so we give the lable to the object 'a1'
const a1 = new Foo('alenka') //this.me puts "me" property directly on a1 object
const a2 = new Foo('arielka') //this.me puts me property directly on a1 object

a1.speak = function(){
    console.log('hi!', this.identity()) // go by prototype chain
}
a1.speak() //create a linkage = [[Prototype]]

console.log(a1.constructor) //? { identity: [Function (anonymous)] } //?
//a1.constructor points to Foo

//__ -> dunder proto :)
console.log(a1.constructor == Foo) //true
console.log(a1.__proto__ == Foo.prototype)
console.log(a1.prototype) //undefined

console.log(Object.getPrototypeOf(a1)) //Obj...identiti, song
console.log(a1.constructor) //Foo
console.log(a1.constructor.prototype) //Obj...identiti, song

console.log(a1.identity()) //get from object..prototype linkage

// crampty technique
//if I wanna use Foo identity func in case I have mine identity func
a1.identity = function(){
console.log('hello ' + Foo.prototype.identity.call(this)) //hello who am i? - alenka
}

//reletive polomorfism ...
//when the identify gets called 'call' makes sure a1 is the binding 

a1.identity()


Foo.prototype.speak = function(){
    return 'Hello there!!! '  + this.identity()
}
console.log(a2.speak())

/*INHERITENCE*/

function Bar(who) {
 Foo.call(this, who)  
}

//Object.create - utility standarazid es 5 and it do: 1 create new object and link it

/** not recommended: Bar.prototype = new Foo() */
// bars prototype extends foos prototype
Bar.prototype = Object.create(Foo.prototype) //linked to foo prototype.
// constructor is broken here
Bar.prototype.speak = function(){console.log('Hello, ' + this.identity()+ '.')}
var b1= new Bar('b1')//Hello, who am i? - b1.
var b2 = new Bar('b2')

//superunicorn magic - this is always bind to what we want
b1.speak() //'this' is b1 
b2.speak() 

//b1.constructor points to Foo... this is weird.
//.constructor - is just a property
console.log(b1.constructor)