# EnhanceGenerator
### Supported for ES2018 and above

If you want some middlewares and loop controle methods **(sync/async)** for **GeneratorFunctions**(**AsyncGeneratorFunctions**), then this package is for you.

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
  .map((value, index) => value * 100)
  .forEach((value, index) => {
    console.log(`index: ${index}, value: ${value}`)
  })


for(const _ of enhanced());
// will be printed:
// index: 0, value: 100
// index: 1, value: 200
// index: 2, value: 300

// // Or You can manually call **next**.
const gen = enhanced()
while(!gen.next(/* nextArg */).done); // nextArg will be passed to original Generator.
```
You can **break** loop, yield value and **continue** iteration, or **skip** both iteration rest and yield stage.
- **continue**
    ```javascript
    const { enhance } = require('enhance-generator')

    const values = []
    for (const val of enhance(genFunc)
        .continue((value, index) => index === 1) // skip rest of middlewares when index === 1   
        .forEach((value, index) => {
            console.log(`index: ${index}`)
        })()
    ) {
      values.push(val)
    }
    // will be printed:
    // index: 0
    // index: 2

    console.log(values)
    // will be yielded
    // [ 1, 2, 3 ]
    ```
- **break**
    ```javascript
    const { enhance } = require('enhance-generator')

    for (const _ of enhance(genFunc)
        .break((value, index) => index === 1) // break on second forEach(index===1)
        .forEach((value, index) => {
            console.log(`index: ${index}`)
        })()
    );
    // will be printed:
    // index: 0

    // will be yielded
    // [ 1 ]
    ```
- **skip**
    ```javascript
    const { enhance } = require('enhance-generator')

    for (const _ of enhance(genFunc)
        .skip((value, index) => index === 1) // skip both rest of middlewares and yield stage   
        .forEach((value, index) => {
            console.log(`index: ${index}`)
        })()
    );
    // will be printed:
    // index: 0
    // index: 2

    // will be yielded
    // [ 1, 3 ]
    ```

You can provide _context_ - **this** both to your GeneratorFunction and to
middlewares you use
```javascript
const { enhance } = require('enhance-generator')

const context = {
    count: 0
}
const enhanced = enhance(genFunc)
    .map((value, index) => value * 100)
    .forEach(function (value, index) {
        this.count++
    })

for (const _ of enhanced
    .useThis(() => context)()
);

console.log(context)
// will be printed:
// { count: 3 }
```
Only the last **useThis** of the chain will be called and
it will be called at the very beginning of the loop -
after **GeneratorFunction() call** and before first **next() call**.

All this methods are **immutable**, i.e. each call of this methods **(map, forEach...)**
will return a new **(Async)GeneratorFunction** with additional middleware layer.

You can also bind _context_ - **this** to layer, by providing it as second argument
to **enhance methods**, in this case calls to **useThis** will not be able to change
context of that particular layer.
```javascript
const { enhance } = require('enhance-generator')

const bindedContext = {
    count: 0
}
const enhanced = enhance(genFunc)
    .map((value, index) => value * 100)
    .forEach(function (value, index) {
        this.count++
    }, bindedContext)

const context = {
    count: 0
}
for (const _ of enhanced
    .useThis(() => context)() // useThis will not be able to change binded contexts
);

console.log(bindedContext)
// will be printed:
// { count: 3 }
console.log(context)
// will be printed:
// { count: 0 }
```

If Your original **GeneratorFunction** needs _context_ - **this**, it will be passed through the
**enhanced** one to it. So the behaviour will be the same for each. e.g.
```javascript
const { enhance } = require('../dist')

function* genFunc() {
    yield 1 * this
    yield 2 * this
    yield 3 * this
    return 'finish'
}
const context = 100

for (const _ of enhance(genFunc)
    .forEach(function (value, index) {
        console.log(value)
    }).call(context)
);
// will be printed
// 100
// 200
// 300
```

You can also automate **next(arg)** call`s argument calculations
```javascript
const { enhance } = require('../dist')

function* genFunc() {
    let nextArg = yield 'enter loop'
    nextArg = yield nextArg
    nextArg = yield nextArg
    return 'exit loop'
}

let nextArg = 0
for (const _ of enhance(genFunc)
    .useNext(() => ++nextArg)
    .forEach(function (value, index) {
        console.log(value)
    })()
);
// will be printed
// 'enter loop'
// 1
// 2
```
**useNext** layers will be called before each iteration except first one, in the same order
they occure in the chain, before all other layers. The returned value
of the last one will be used to call **next(arg)** on the **Origin Generator**.

Example with multiple **useNext** layers
```javascript
const { enhance } = require('../dist')

function* genFunc() {
    let nextArg = yield 'enter loop'
    nextArg = yield nextArg
    nextArg = yield nextArg
    return 'exit loop'
}

let nextArg = 0
for (const _ of enhance(genFunc)
    .useNext(() => ++nextArg)
    .useNext(() => ++nextArg)
    .forEach(function (value, index) {
        console.log(value)
    })
    .useNext(() => ++nextArg)()
);
// will be printed
// 'enter loop'
// 3
// 6
```
> NOTE: The first call **next(arg)** just enter the loop, it`s argument thrown
by Generator itself, so the first iteration is skiped.


**EnhancedGeneratorFunctions** are simple **GeneratorFunctions** Or **AsyncGeneratorFunctions**
with some additional methods on them, So you can pass them to any library
that accepts **GeneratorFunctions** Or **AsyncGeneratorFunctions**

### Async
You can Use **async functions**, in layer addition methods **(map,forEach...)**, also you can use **AsyncGeneratorFunctions** when calling **enhance(generatorFunction)**. Saying **async**,
we mean explicit usage of **async keyword**. From the point of the time that you used
**AsyncFunction**  or **AsyncGeneratorFunction**, resulting **EnhancedGeneratorFunctions** will be **async** as well. You can check if it is with property **isAsync** on returned **EnhancedGeneratorFunctions**.
> NOTE: In this cases you must be careful and be sure you call them with **for await of...**
and not with **for of...**.

When you instead of **async keyword** use a simple function which returns **Promise** it will not be awaited, it will be passed directly (if it expected to be passed, as with **map**) to next layer as simple value.