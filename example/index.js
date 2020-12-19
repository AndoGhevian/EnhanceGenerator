const { enhance } = require('../dist')


const originalGenFunc = function* () {
    yield 1
    yield 2
    yield 3
    return 'hey'
}
const enhancedGenFunc_1 = enhance(originalGenFunc)
    .map((val) => val * 7)
    .findIndex(val => val === 22)
    .forEach(
        function () {
            console.log(this)
        },
        {
            name: 'enhancedGenFunc_1 forEach'
        },
    );

const enhancedGenFunc_2 = enhancedGenFunc_1.clone()
    .forEach(() => console.log('enhancedGenFunc_2 forEach'))

console.log('____________________________')
console.log('enhancedGenFunc_1 TEST')
console.log('____________________________')
const gen_1 = enhancedGenFunc_1()
let nextVal = gen_1.next()
while (!nextVal.done) {
    console.log(nextVal.value + ' number')
    nextVal = gen_1.next()
}

console.log(nextVal)

console.log('____________________________')
console.log('enhancedGenFunc_2 TEST')
console.log('____________________________')
const gen_2 = enhancedGenFunc_2()
let nextVal2 = gen_2.next()
while (!nextVal2.done) {
    console.log(nextVal2.value + ' number')
    nextVal2 = gen_2.next()
}

console.log(nextVal2)

console.log('____________________________')
console.log('enhancedGenFunc_2 TEST if it is GeneratorFunction')
console.log('____________________________')
const GenFuncConstructor = Object.getPrototypeOf(function* () { }).constructor
console.log(enhancedGenFunc_2.__proto__.constructor === GenFuncConstructor)