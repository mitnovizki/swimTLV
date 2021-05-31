/*What we will be building in this tutorial
EventEmitter class
on / addEventListener method
off / removeEventListener method
once method
emit method
rawListeners method
listenerCount method
The above basic features are sufficient to implement a full system using the eventing model.

Before we get into the coding, let’s take a look at how we will be using the EventEmitter class. Please note that our code will mimic the exact API of the Node.js ‘events’ module.

In fact, if you replace our EventEmitter with Node.js’s built-in ‘events’ module you will get the same result.

Example 1 — Create an event emitter instance and register a couple of callbacks
*/

const eventsEm = require('events')
const myEmitter = new eventsEm()
// const myEmitter = new EventEmitter()

function c1() {
  console.log('1: function')
}

function c2() {
  console.log('2: function')
}

myEmitter.on('eventOne', c1)
myEmitter.on('eventOne', c2)

myEmitter.emit('eventOne')

myEmitter.once('eventOnce', () => console.log('eventOnce once fired'));
myEmitter.emit('eventOnce')

myEmitter.emit('eventOnce')