# EnhanceGenerator
If you want some **array** methods for **GeneratorFunctions** which will be called
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

const enhanced = enhance(genFunc) // New GeneratorFunction with additional methods on it.
enhanced
  .map(nth => `${nth} man`)


const gen = enhanced()
for(const val of gen) {
    console.log(`yield ${val}`)
}
// will be printed:
// yield 1 man
// yield 2 man
// yield 3 man
```

Or You can manually call **next**.
```javascript
const { enhance } = require('enhance-generator')

const enhanced = enhance(genFunc)
enhanced
  .map(val => val * 1000)


const gen = enhanced()
let nextVal = gen.next(/* nextArg */)
while(!nextVal.done) {
    console.log(`yield ${nextVal.value}`)
    nextVal = gen.next(/* nextArg */) // nextArg will be passed to original Generator.
}
// will be printed:
// yield 1000
// yield 2000
// yield 3000
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
enhanced
  .find(val => val === 2)


const gen = enhanced('start value')
let nextVal = gen.next()
while(!nextVal.done) {
    console.log(`yield ${nextVal.value}`)
    nextVal = gen.next()
}
console.log(nextVal)
// will be printed:
// yield start value
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
enhanced
  .map(val => val * 100)
  .map((val, index) => val + index)
  .find(val => val === 201) // will short-circuit on value 201.
  .every(val => val !== 400) // if false, will be immediately returned with current value.


const gen = enhanced()
let nextVal = gen.next()
while(!nextVal.done) {
    console.log(`yield ${nextVal.value}`)
    nextVal = gen.next()
}
console.log(nextVal)
// will be printed:
// yield 100
// { value: 201, done: true }
```

Theres also method for side effects - **forEach**, which returned values will be simply throwed away.

If you noticed, all these methods are not **immutable**, they are modifying initial **Enhanced GeneratorFunction** behaviour **(But not the original one)**, so if you want, you can any time
**fork** the **enhanced GeneratorFunction** with **clone** method.

```javascript
const { enhance } = require('enhance-generator')

function* genFunc() {
    yield 1
    yield 2
    yield 3
    return 'finish'
}
const enhanced_1 = enhance(genFunc)
enhanced_1
  .map(val => val * 100)
  
const enhanced_2 = enhanced_1.clone()
  .map((val, index) => val + ' What?')

enhanced_1
  .map(val => val + 2)

const gen_1 = enhanced_1()
for(const val of gen_1) {
    console.log(val)
}
// will be printed:
// 102
// 202
// 302

const gen_2 = enhanced_2()
for(const val of gen_2) {
    console.log(val)
}
// will be printed:
// 100 what?
// 200 what?
// 300 what?
```
You can pass **this context** to all given methods **(map, some...)** with second argument -
**thisArg**
> Note: If its not provided, **undefined** will be used. The this value ultimately observable by callback is determined according to [the usual rules for determining the this seen by a function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).
```javascript
const { enhance } = require('enhance-generator')

function* genFunc() {
    yield 1
    yield 2
    yield 3
    return 'finish'
}
const enhanced = enhance(genFunc)
  .map(function (val) { return this.prop + val }, { prop: 'any value ' })

const gen = enhanced()
for(const val of gen) {
    console.log(val)
}
// will be printed:
// any value 1
// any value 2
// any value 3
```
If Your original **GeneratorFunction** use **this context**, it will be passed through the
**enhanced** one to it. So the behaviour will be the same for each.

You can use this **Enhanced GeneratorFunctions** as the original ones. They are simple **GeneratorFunctions** with some additional methods on them, So you can pass them
to any library that accepts **GeneratorFunctions**.
You can check if some function is **Enhanced Generator Function** with property **isEnhancedGeneratorFunction**.