export const SymbolLayers = Symbol('SymbolLayers')
export type SymbolLayers = typeof SymbolLayers

export const SymbolGenFunc = Symbol('SymbolGenFunc')
export type SymbolGenFunc = typeof SymbolGenFunc

export type Layers = Exclude<keyof EnhancedGeneratorFunction, 'isEnhancedGeneratorFunction' | 'clone'>
export const Layers: Layers[] = ['map', 'forEach', 'some', 'every', 'find', 'findIndex']

export interface Layer {
    layer: Layers;
    handler: Function;
    thisArg: any;
}

export interface Enhance {
    <T, R, N, C extends any[]>(generatorFunction: (...args: [...C]) => Generator<T, R, N>): EnhancedGeneratorFunction<T, R, N, C>;
}

export interface EnhancedGeneratorFunction<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> {
    isEnhancedGeneratorFunction: true;

    map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C>;
    forEach<U>(callbackfn: (value: T, index: number) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C>;
    some(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    every(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    find(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    findIndex(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C>;
    clone(): EnhancedGeneratorFunction<T, R, N, C>;
    (...args: [...C]): Generator<T, R, N>;
}
export interface EnhancedGeneratorFunctionPrivate extends EnhancedGeneratorFunction {
    [SymbolLayers]: Layer[]
    [SymbolGenFunc]: (...args: any[]) => Generator
}

import layerInserters from './layerInserters'



export const enhance: Enhance = function (generatorFunction) {
    const layers: Layer[] = []
    const originalGenFunc = generatorFunction


    return initEnhancedGeneratorFunction(originalGenFunc, layers) as any
}

function clone(this: EnhancedGeneratorFunctionPrivate): EnhancedGeneratorFunctionPrivate {
    const layers: Layer[] = [...this[SymbolLayers]]
    const originalGenFunc = this[SymbolGenFunc]


    return initEnhancedGeneratorFunction(originalGenFunc, layers)
}



function initEnhancedGeneratorFunction(
    originalGenFunc: (...args: any) => Generator,
    layers: Layer[]
): EnhancedGeneratorFunctionPrivate {
    const enhancedGeneratorFunction: EnhancedGeneratorFunctionPrivate = function* (this: any, ...args: any[]) {
        const gen = enhancedGeneratorFunctionSketch.call(
            this,
            originalGenFunc,
            layers,
            args
        )
        let nextArg: any
        while (true) {
            const nextVal = gen.next(nextArg)
            if (nextVal.done) {
                return nextVal.value
            }
            nextArg = yield nextVal.value
        }
    } as any

    enhancedGeneratorFunction.isEnhancedGeneratorFunction = true
    for (const layer of Layers) {
        enhancedGeneratorFunction[layer] = layerInserters[layer] as any
    }
    enhancedGeneratorFunction.clone = clone

    Object.defineProperty(enhancedGeneratorFunction, SymbolLayers, {
        value: layers,
    })
    Object.defineProperty(enhancedGeneratorFunction, SymbolGenFunc, {
        value: originalGenFunc,
    })
    Object.defineProperties(enhancedGeneratorFunction, {
        isEnhancedGeneratorFunction: { enumerable: false },
        map: { enumerable: false },
        forEach: { enumerable: false },
        some: { enumerable: false },
        every: { enumerable: false },
        find: { enumerable: false },
        findIndex: { enumerable: false },
        clone: { enumerable: false },
    })
    return enhancedGeneratorFunction
}

function* enhancedGeneratorFunctionSketch(
    this: any,
    originalGenFunc: (...args: any) => Generator,
    layers: Layer[],
    originalGenFuncCallArgs: any[]
) {
    const gen = originalGenFunc.apply(this, originalGenFuncCallArgs)
    let nextArg: any

    let index = 0
    while (true) {
        const nextVal = gen.next(nextArg)
        if (nextVal.done) {
            return nextVal.value
        }

        let modifiedNextVal = nextVal.value
        for (const { handler, layer, thisArg } of layers) {
            const handlerResult = handler.call(thisArg, modifiedNextVal, index)
            switch (layer) {
                case 'map':
                    modifiedNextVal = handlerResult
                    break
                case 'find':
                case 'some':
                    if (handlerResult) {
                        return modifiedNextVal
                    }
                    break
                case 'every':
                    if (!handlerResult) {
                        return modifiedNextVal
                    }
                    break
                case 'findIndex':
                    if (handlerResult) {
                        return index
                    }
                    break
                case 'forEach':
                default:
                    break
            }
        }

        nextArg = yield modifiedNextVal
        index++
    }
}