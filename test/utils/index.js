const AsyncGeneratorConstructor = Object.getPrototypeOf((async function* () { })()).constructor;
const GeneratorConstructor = Object.getPrototypeOf((function* () { })()).constructor;

const AsyncGeneratorFunctionConstructor = Object.getPrototypeOf((async function* () { })).constructor;
const GeneratorFunctionConstructor = Object.getPrototypeOf((function* () { })).constructor;

const AsyncFunctionConstructor = Object.getPrototypeOf((async function () { })).constructor;
const FunctionConstructor = Object.getPrototypeOf((function () { })).constructor;

function isAsyncGenerator(val) {
    return val instanceof AsyncGeneratorConstructor;
}

function isGenerator(val) {
    return val instanceof GeneratorConstructor;
}

function isAsyncGeneratorFunction(val) {
    return val instanceof AsyncGeneratorFunctionConstructor;
}

function isGeneratorFunction(val) {
    return val instanceof GeneratorFunctionConstructor;
}

function isAsyncFunction(val) {
    return val instanceof AsyncFunctionConstructor;
}

function isFunction(val) {
    return val instanceof FunctionConstructor;
}

async function sleep(time = 1000) {
    return new Promise(res => setTimeout(res, time))
}


module.exports = {
    isAsyncGenerator,
    isGenerator,
    isAsyncGeneratorFunction,
    isGeneratorFunction,
    isAsyncFunction,
    isFunction,
    sleep,
}