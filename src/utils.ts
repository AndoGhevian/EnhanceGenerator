const GeneratorConstructor = Object.getPrototypeOf((function* () { })()).constructor
const AsyncGeneratorConstructor = Object.getPrototypeOf((async function* () { })()).constructor

const GeneratorFunctionConstructor = Object.getPrototypeOf((function* () { })).constructor
const AsyncGeneratorFunctionConstructor = Object.getPrototypeOf((async function* () { })).constructor

const FunctionConstructor = Object.getPrototypeOf((function () { })).constructor
const AsyncFunctionConstructor = Object.getPrototypeOf((async function () { })).constructor


function isAsyncGenerator(val: any): val is AsyncGenerator {
    return val instanceof AsyncGeneratorConstructor
}

function isGenerator(val: any): val is Generator {
    return val instanceof GeneratorConstructor
}

function isAsyncGeneratorFunction(val: any): val is AsyncGeneratorFunction {
    return val instanceof AsyncGeneratorFunctionConstructor
}

function isGeneratorFunction(val: any): val is GeneratorFunction {
    return val instanceof GeneratorFunctionConstructor
}

function isAsyncFunction(val: any): val is (...args: any[])=>Promise<unknown> {
    return val instanceof AsyncFunctionConstructor
}

function isFunction(val: any): val is Function {
    return val instanceof FunctionConstructor
}



export {
    isAsyncGenerator,
    isGenerator,
    isAsyncGeneratorFunction,
    isGeneratorFunction,
    isAsyncFunction,
    isFunction,
}