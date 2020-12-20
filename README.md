# EnhanceGenerator
If you want some middlewares for **GeneratorFunctions** which will be called
on each **yield** value, then this package is for you.

## Usage
Lets say we have **GeneratorFunction**:
```javascript
function* genFunc() {
    yield 1
    yield 2
    yield 3
    return 'finish'
}
```
If you want to map **yielded** values to another ones:
```javascript
const { enhance } = require('enhance-generator')

// New GeneratorFunction with additional methods on it.
const enhanced = enhance(genFunc)
  .map(nth => `${nth} man`)


const gen = enhanced()
for(const val of gen) {
    console.log(val)
}
// will be printed:
// 1 man
// 2 man
// 3 man
```

Or You can manually call **next**.
```javascript
const { enhance } = require('enhance-generator')

const enhanced = enhance(genFunc)
  .map(val => val * 1000)


const gen = enhanced()
let nextVal = gen.next(/* nextArg */)
while(!nextVal.done) {
    console.log(nextVal.value)
    nextVal = gen.next(/* nextArg */) // nextArg will be passed to original Generator.
}
// will be printed:
// 1000
// 2000
// 3000
```
You can make also some desigions on **yielded** values,
and when some **condition (find, some...)** is fulfilled, **Generator** will return.
```javascript
const { enhance } = require('enhance-generator')

function* genFunc(start) {
    yield start ? start : 1
    yield 2
    yield 3
    return 'finish'
}
const enhanced = enhance(genFunc)
  .find(val => val === 2)


const gen = enhanced('start value')
let nextVal
while(nextVal = gen.next(), !nextVal.done) {
    console.log(nextVal.value)
}

console.log(nextVal)
// will be printed:
// start value
// { value: 2, done: true }
```

You can make chains of both **maps** and **conditions**:
> Note: **Conditions** will be chained with **Logical OR** with **short-circuit** evaluation.
```javascript
const { enhance } = require('enhance-generator')

function* genFunc() {
    yield 1
    yield 2
    yield 3
    return 'finish'
}
const enhanced = enhance(genFunc)
  .map(val => val * 100)
  .map((val, index) => val + index)
  .find(val => val === 201) // will short-circuit on value 201.
  .every(val => val !== 400) // if false, will be immediately returned with current value.


const gen = enhanced()
let nextVal
while(nextVal = gen.next(), !nextVal.done) {
    console.log(nextVal.value)
}
console.log(nextVal)
// will be printed:
// 100
// { value: 201, done: true }
```

Theres also method for side effects - **forEach**, which returned values will be simply throwed away.

All this methods are **immutable**, i.e. each call of this methods **(map, some...)**
will return a new **GeneratorFunction** with additional middleware layer.

You can pass **this context** to all given methods **(map, some...)** with second argument -
**thisArg**
> Note: If its not provided, **undefined** will be used. The **this** value ultimately observable by callback is determined according to [the usual rules for determining the this seen by a function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).
```javascript
const { enhance } = require('enhance-generator')

function* genFunc() {
    yield 1
    yield 2
    yield 3
    return 'finish'
}
const enhanced = enhance(genFunc)
  .map(function (val) { 
    return this.prop += val
    }, { prop: 0 })

const gen = enhanced()
for(const val of gen) {
    console.log(val)
}
// will be printed:
// 1
// 3
// 6
```
If Your original **GeneratorFunction** use **this context**, it will be passed through the
**enhanced** one to it. So the behaviour will be the same for each.

You can use this **Enhanced GeneratorFunctions** as the original ones. They are simple **GeneratorFunctions** with some additional methods on them, So you can pass them
to any library that accepts **GeneratorFunctions**.
You can check if some function is **Enhanced Generator Function** with property **isEnhancedGeneratorFunction** on it.