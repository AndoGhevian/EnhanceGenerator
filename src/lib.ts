import {
    isAsyncGenerator,
    isGenerator,
    isAsyncGeneratorFunction,
    isGeneratorFunction,
    isAsyncFunction,
    isFunction,
} from './utils'

/**Symbol of layers of EnhancedGeneratorFunction */
export const SymbolLayers = Symbol('SymbolLayers')
export type SymbolLayers = typeof SymbolLayers

/**Symbol of original GeneratorFunction/AsyncGeneratorFunction */
export const SymbolGenFunc = Symbol('SymbolGenFunc')
export type SymbolGenFunc = typeof SymbolGenFunc

/**Middlware layer types */
export type Layers = 'map' | 'forEach' | 'break' | 'continue' | 'skip'
export const Layers: Layers[] = ['map', 'forEach', 'break', 'continue', 'skip']

/**Middleware Layer */
export interface Layer {
    /**Layer type */
    layer: Layers;
    /**Layer handler */
    handler: Function;
    /****this** arg for layer handler */
    thisArg: any;
    /**Indicates if handler is AsyncFunction */
    isAsync: boolean;
}

/**Enhance GeneratorFunction/AsyncGeneratorFunction with additional methods. */
export interface Enhance {
    <U extends Generator | AsyncGenerator, C extends any[]>(generatorFunction: (...args: [...C]) => U):
        U extends Generator<infer T, infer R, infer N> ? EnhancedGeneratorFunction<T, R, N, C>
        : U extends AsyncGenerator<infer T, infer R, infer N> ? AsyncEnhancedGeneratorFunction<T, R, N, C>
        : never;
}

export interface AsyncEnhancedGeneratorFunction<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> {
    /**Indicates that this is EnhancedGeneratorFunction */
    isEnhancedGeneratorFunction: true;
    /**Indicates if original GeneratorFunction is Async, i.e. AsyncGeneratorFunction */
    isOriginalAsync: boolean;
    /**Indicates if this EnhancedGeneratorFunction (chain) is Async, i.e. AsyncGeneratorFunction */
    isAsync: true;
    /**Getter for layers of this EnhancedGeneratorFunction */
    layers: Layer[]
    /**Getter for original GeneratorFunction (AsyncGeneratorFunction) of this EnhancedGeneratorFunction */
    originalGeneratorFunction: GeneratorFunction | AsyncGeneratorFunction

    /**Map values to another ones, returned by callbackfn */
    map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<infer X> ? AsyncEnhancedGeneratorFunction<X, R, N, C> | AsyncEnhancedGeneratorFunction<U, R, N, C>
        : AsyncEnhancedGeneratorFunction<U, R, N, C>;
    /**Do some stuff before yield */
    forEach<U extends void | Promise<void> = void>(callbackfn: (value: T, index: number) => U, thisArg?: any): AsyncEnhancedGeneratorFunction<T, R, N, C>
    /**If predicate return truthy value, rest of the layers in the chain will be skiped, current value will **NOT BE** yielded, and generator will continue */
    skip<U extends void | Promise<void> = void>(callbackfn: (value: T, index: number) => U, thisArg?: any): AsyncEnhancedGeneratorFunction<T, R, N, C>
    /**If predicate return truthy value, GeneratorFunction will be returned with current value */
    break<U extends any = unknown>(predicate: (value: T, index: number) => U, thisArg?: any): AsyncEnhancedGeneratorFunction<T, T | R, N, C>;
    /**If predicate return truthy value, rest of the layers in the chain will be skiped, current value will **BE** yielded, and generator will continue  */
    continue<U extends any = any>(callbackfn: (value: T, index: number) => U, thisArg?: any): AsyncEnhancedGeneratorFunction<T, R, N, C>
    (...args: [...C]): AsyncGenerator<T, R, N>;
}
export interface EnhancedGeneratorFunction<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> {
    /**Indicates that this is EnhancedGeneratorFunction */
    isEnhancedGeneratorFunction: true;
    /**Indicates if original GeneratorFunction is Async, i.e. AsyncGeneratorFunction */
    isOriginalAsync: false;
    /**Indicates if this EnhancedGeneratorFunction (chain) is Async, i.e. AsyncGeneratorFunction */
    isAsync: false;
    /**Getter for layers of this EnhancedGeneratorFunction */
    layers: Layer[]
    /**Getter for original GeneratorFunction (AsyncGeneratorFunction) of this EnhancedGeneratorFunction */
    originalGeneratorFunction: GeneratorFunction | AsyncGeneratorFunction

    /**Map values to another ones, returned by callbackfn */
    map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<infer X> ? AsyncEnhancedGeneratorFunction<X, R, N, C> | AsyncEnhancedGeneratorFunction<U, R, N, C>
        : EnhancedGeneratorFunction<U, R, N, C>;
    /**Do some stuff before yield */
    forEach<U extends void | Promise<void> = void>(callbackfn: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<any> ? AsyncEnhancedGeneratorFunction<T, R, N, C>
        : EnhancedGeneratorFunction<T, R, N, C>;
    /**If predicate return truthy value, rest of the layers in the chain will be skiped, current value will **NOT BE** yielded, and generator will continue */
    skip<U extends any = any>(callbackfn: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<any> ? AsyncEnhancedGeneratorFunction<T, R, N, C>
        : EnhancedGeneratorFunction<T, R, N, C>;
    /**If predicate return truthy value, GeneratorFunction will be returned with current value */
    break<U extends any = unknown>(predicate: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<any> ? AsyncEnhancedGeneratorFunction<T, T | R, N, C>
        : EnhancedGeneratorFunction<T, T | R, N, C>;
    /**If predicate return truthy value, rest of the layers in the chain will be skiped, current value will **BE** yielded, and generator will continue  */
    continue<U extends any = unknown>(callbackfn: (value: T, index: number) => U, thisArg?: any):
        U extends Promise<any> ? AsyncEnhancedGeneratorFunction<T, R, N, C>
        : EnhancedGeneratorFunction<T, R, N, C>;
    (...args: [...C]): Generator<T, R, N>;
}
export type EnhancedGeneratorFunctionPrivate<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> =
    (
        (
            EnhancedGeneratorFunction<T, R, N, C> & {
                [SymbolGenFunc]: (...args: any[]) => Generator;
            }
        ) | (
            AsyncEnhancedGeneratorFunction<T, R, N, C> & {
                [SymbolGenFunc]: (...args: any[]) => Generator | AsyncGenerator;
            }
        )
    ) & { [SymbolLayers]: Layer[]; };

export const enhance: Enhance = function (generatorFunction) {
    const layers: Layer[] = []
    const originalGenFunc = generatorFunction

    const isOriginalAsync = isAsyncGeneratorFunction(originalGenFunc)
    const isOriginalSync = isGeneratorFunction(originalGenFunc)
    if (!isOriginalSync && !isOriginalAsync) {
        throw new Error('Please Provide (sync/async)GeneratorFunction, promise returning(yielding) functions PREFERED TO be specified with async keyword')
    }

    return initEnhancedGeneratorFunction(originalGenFunc, layers, isOriginalAsync, isOriginalAsync) as any
}

// Layer Inserters created ones -
const layerInserters: {
    [P in Layers]: (this: EnhancedGeneratorFunctionPrivate, cb: Function, thisArg?: any) => EnhancedGeneratorFunctionPrivate;
} = {} as any

for (const layer of Layers) {
    layerInserters[layer] = function (handler, thisArg) {
        const originalGenFunc = this[SymbolGenFunc]

        const isLayerAsync = isAsyncFunction(handler)
        const isLayerSync = isFunction(handler)
        if (!isLayerSync && !isLayerAsync) {
            throw new Error('Please Provide (sync/async)Function, promise returning functions PREFERED TO be specified with async keyword')
        }
        const layers: Layer[] = [...this[SymbolLayers], {
            layer,
            handler,
            thisArg,
            isAsync: isLayerAsync,
        }]

        return initEnhancedGeneratorFunction(originalGenFunc, layers, this.isOriginalAsync, this.isAsync || isLayerAsync)
    }
}


function initEnhancedGeneratorFunction(
    originalGenFunc: (...args: any) => Generator | AsyncGenerator,
    layers: Layer[],
    isOriginalAsync: boolean,
    isAsync: boolean,
): EnhancedGeneratorFunctionPrivate {
    let enhancedGeneratorFunction: EnhancedGeneratorFunctionPrivate = function* (this: any, ...args: any[]) {
        const gen = enhancedGeneratorFunctionSketch.call(
            this,
            originalGenFunc,
            layers,
            args,
            isOriginalAsync,
            isAsync,
        ) as any
        let nextArg: any
        while (true) {
            const nextVal = gen.next(nextArg)
            if (nextVal.done) {
                return nextVal.value
            }
            nextArg = yield nextVal.value
        }
    } as any
    if (isAsync) {
        enhancedGeneratorFunction = async function* (this: any, ...args: any[]) {
            const gen = enhancedGeneratorFunctionSketch.call(
                this,
                originalGenFunc,
                layers,
                args,
                isOriginalAsync,
                isAsync,
            ) as any
            let nextArg: any
            while (true) {
                const nextVal = await gen.next(nextArg)
                if (nextVal.done) {
                    return nextVal.value
                }
                nextArg = yield nextVal.value
            }
        } as any
    }

    enhancedGeneratorFunction.isEnhancedGeneratorFunction = true
    enhancedGeneratorFunction.isOriginalAsync = isOriginalAsync
    enhancedGeneratorFunction.isAsync = isAsync
    for (const layer of Layers) {
        enhancedGeneratorFunction[layer] = layerInserters[layer] as any
    }

    Object.defineProperty(enhancedGeneratorFunction, SymbolLayers, {
        value: layers,
    })
    Object.defineProperty(enhancedGeneratorFunction, SymbolGenFunc, {
        value: originalGenFunc,
    })
    Object.defineProperties(enhancedGeneratorFunction, {
        isEnhancedGeneratorFunction: { enumerable: false },
        isOriginalAsync: { enumerable: false },
        isAsync: { enumerable: false },
        layers: {
            enumerable: false,
            get() {
                return this[SymbolLayers].map((layer: any) => ({
                    ...layer
                }))
            },
        },
        originalGeneratorFunction: {
            enumerable: false,
            get() {
                return this[SymbolGenFunc]
            },
        },
        map: { enumerable: false },
        forEach: { enumerable: false },
        skip: { enumerable: false },
        break: { enumerable: false },
        continue: { enumerable: false },
    })
    return enhancedGeneratorFunction
}

function enhancedGeneratorFunctionSketch(
    this: any,
    originalGenFunc: (...args: any) => Generator | AsyncGenerator,
    layers: Layer[],
    originalGenFuncCallArgs: any[],
    isOriginalAsync: boolean,
    isAsync: boolean,
) {
    const gen = originalGenFunc.apply(this, originalGenFuncCallArgs) as any

    if (isAsync) {
        return (async function* () {
            let nextArg: any

            let index = 0
            while (true) {
                let nextVal: any
                if (isOriginalAsync) {
                    nextVal = await gen.next(nextArg)
                } else {
                    nextVal = gen.next(nextArg)
                }

                if (nextVal.done) {
                    return nextVal.value
                }

                let modifiedNextVal = nextVal.value
                let skip = false
                let skipAndYield = false
                for (const { handler, layer, thisArg, isAsync } of layers) {
                    const handlerResult = isAsync ? await handler.call(thisArg, modifiedNextVal, index) : handler.call(thisArg, modifiedNextVal, index)
                    switch (layer) {
                        case 'map':
                            modifiedNextVal = handlerResult
                            break
                        case 'forEach':
                            break
                        case 'skip':
                            if (handlerResult) {
                                skip = true
                            }
                            break
                        case 'break':
                            if (handlerResult) {
                                return modifiedNextVal
                            }
                            break
                        case 'continue':
                            if (handlerResult) {
                                skipAndYield = true
                            }
                            break
                        default:
                            break
                    }

                    if (skip || skipAndYield) break
                }

                if (!skip) {
                    nextArg = yield modifiedNextVal
                }
                index++
            }
        })()
    }

    const syncGen = gen as Generator<unknown, any, unknown>
    return (function* () {
        let nextArg: any

        let index = 0
        while (true) {
            const nextVal = syncGen.next(nextArg)
            if (nextVal.done) {
                return nextVal.value
            }

            let modifiedNextVal = nextVal.value
            let skip = false
            let skipAndYield = false
            for (const { handler, layer, thisArg } of layers) {
                const handlerResult = handler.call(thisArg, modifiedNextVal, index)
                switch (layer) {
                    case 'map':
                        modifiedNextVal = handlerResult
                        break
                    case 'forEach':
                        break
                    case 'skip':
                        if (handlerResult) {
                            skip = true
                        }
                        break
                    case 'break':
                        if (handlerResult) {
                            return modifiedNextVal
                        }
                        break
                    case 'continue':
                        if (handlerResult) {
                            skipAndYield = true
                        }
                        break
                    default:
                        break
                }

                if (skip || skipAndYield) break
            }

            if (!skip) {
                nextArg = yield modifiedNextVal
            }
            index++
        }
    })()
}

// // Previous EnhancedGenerator interface v1
// export interface AsyncEnhancedGeneratorFunction<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> {
//     isEnhancedGeneratorFunction: true;

//     /**Map values to another ones, returned by callbackfn */
//     map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C>;
//     /**Do some stuff on next call */
//     forEach<U>(callbackfn: (value: T, index: number) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C>;
//     /**If predicate return truthy value, GeneratorFunction will be returned with current value */
//     some(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
//     /**If predicate return falsey value, GeneratorFunction will be returned with current value */
//     every(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
//     /**If predicate return truthy value, GeneratorFunction will be returned with current value(Same as _some_) */
//     find(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
//     /**If predicate return truthy value, GeneratorFunction will be returned with current yield index */
//     findIndex(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C>;
//     (...args: [...C]): Generator<T, R, N>;
// }