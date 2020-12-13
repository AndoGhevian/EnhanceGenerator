interface Enhance {
    <T, R, N, C extends any[]>(generatorFunction: (...args: [...C]) => Generator<T, R, N>): EnhancedGeneratorFunction<T, R, N, C>;
}


type ExtendLayer<T, L extends any[]> = [...L, T]
type BuildEnhancedGenerator<T, R, N, TValue, TLayerIndex extends number, TField extends 'some' | 'every' | 'indexOf' | 'find' | 'findIndex' | 'map' | 'forEach' | undefined> = {
    isEnhancedGenerator: true;

    terminationField: TField;
    terminationIndex: TLayerIndex;
    terminationValue: TValue;
} & Generator<T, R, N>

interface InitialEnhancedGenerator<T, R, N> extends Generator<T, R, N> {
    isEnhancedGenerator: true;

    terminationField: undefined;
    terminationIndex: 0;
    terminationValue: R;
}
interface MutationEnhancedGenerator<T, R, N> extends Generator<T, R, N> {
    isEnhancedGenerator: true;

    terminationField: 'map' | 'forEach';
    terminationIndex: number;
    terminationValue: never;
}
interface DesigionEnhancedGenerator<T, R, N, TValue = any> extends Generator<T, R, N> {
    isEnhancedGenerator: true;

    terminationField: 'some' | 'every' | 'indexOf' | 'find' | 'findIndex';
    terminationIndex: number;
    terminationValue: TValue;
}
type EnhancedGenerator<T, R, N, TValue = unknown> = InitialEnhancedGenerator<T, R, N>
    | MutationEnhancedGenerator<T, R, N>
    | DesigionEnhancedGenerator<T, R, N, TValue>
// type EnhancedGeneratorPrivate<T, R, N, TValue = unknown> = EnhancedGenerator<T, R, N, TValue> & {
//     _isEnhancedGenerator: true;
// }


interface EnhancedGeneratorFunction<T, R, N, C extends any[],
    TLayer extends any[] = [R],
    TEnhancedGenerator extends EnhancedGenerator<any, any, any> = BuildEnhancedGenerator<T, R, N, R, 0, undefined>> {
    isEnhancedGeneratorFunction: true;
    layers: {
        layerField: 'some' | 'every' | 'indexOf' | 'find' | 'findIndex' | 'map' | 'forEach';
        layerHandler: Function;
        layerHandlerThisArg: any;
    }[];
    originalGeneratorFunction: (...args: any[]) => Generator

    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C,
        [...TLayer, never],
        TEnhancedGenerator | BuildEnhancedGenerator<U, R, N, never, TLayer['length'], 'map'>>;
    forEach<U>(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C,
        [...TLayer, never],
        TEnhancedGenerator | BuildEnhancedGenerator<T, R, N, never, TLayer['length'], 'forEach'>>;
    some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'some'>>;
    every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'every'>>;
    indexOf(searchElement: T, fromIndex?: number): EnhancedGeneratorFunction<T, number | R, N, C,
        [...TLayer, number],
        TEnhancedGenerator | BuildEnhancedGenerator<T, number | R, N, number, TLayer['length'], 'indexOf'>>;
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'find'>>;
    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C,
        [...TLayer, number],
        TEnhancedGenerator | BuildEnhancedGenerator<T, number | R, N, number, TLayer['length'], 'findIndex'>>;
    (...args: [...C]): TEnhancedGenerator;
}
// interface EnhancedGeneratorFunctionPrivate<T, R, N, C extends any[]> extends EnhancedGeneratorFunction<T, R, N, C> {
//     _isEnhancedGeneratorFunction: true;
//     _layers: {
//         layerField: 'some' | 'every' | 'indexOf' | 'find' | 'findIndex' | 'map' | 'forEach' | undefined;
//         layerHandler: Function;
//         layerHandlerThisArg: any;
//     }[];
// }



const map = function (this: EnhancedGeneratorFunction<any, any, any, any>, cb: any, thisArg: any) {
    const generatorFunction = this
    const enhancedGeneratorFunction: EnhancedGeneratorFunction<any, any, any, any> = function* (this: any, ...args: any[]) {
        const gen = generatorFunction.originalGeneratorFunction.apply(this, args as any)
        while (true) {
            let nextVal!: IteratorResult<any,any>
            try {
                nextVal = gen.next()
            } catch(err) {
                
            }
            if(nextVal.done) return nextVal.value
            for (const layer of enhancedGeneratorFunction.layers) {

            }
        }
    } as any

    enhancedGeneratorFunction.layers = [...generatorFunction.layers, {
        layerField: 'map',
        layerHandler: cb,
        layerHandlerThisArg: thisArg,
    }]
    assignProperties(enhancedGeneratorFunction)

    return enhancedGeneratorFunction
}

const enhance: Enhance = function (generatorFunction) {
    const enhancedGeneratorFunction = function* (this: any, ...args: any[]) {
        const gen = generatorFunction.apply(this, args as any)
    } as any

    enhancedGeneratorFunction.layers = []
    assignProperties(generatorFunction)

    return enhancedGeneratorFunction as any
}

function assignProperties(generatorFunction: any) {
    generatorFunction.isEnhancedGeneratorFunction = true
    generatorFunction.map = map
    // generatorFunction.forEach = forEach
    // generatorFunction.some = some
    // generatorFunction.every = every
    // generatorFunction.indexOf = indexOf
    // generatorFunction.find = find
    // generatorFunction.findIndex = findIndex
}































// const f = function* () {
//     yield 1
//     yield 2
//     return 5
// }

// const g = function (x?: number) {
//     // yield 'hello world'
//     return 'what?'
// }

// Object.setPrototypeOf(g, {})

// const gen = g()
// console.log(Object.getOwnPropertyNames(g))
// console.log(g.arguments)
// // console.log(gen.next())
// // console.log(gen.next())
// // console.log(gen.next())