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

/**Symbol of UseThis layer */
export const SymbolUseThis = Symbol('SymbolUseThis')
export type SymbolUseThis = typeof SymbolUseThis

/**Symbol of UseNext layers */
export const SymbolUseNext = Symbol('SymbolUseNext')
export type SymbolUseNext = typeof SymbolUseNext

/**Middlware layer types */
export type Layers = 'map' | 'forEach' | 'break' | 'continue' | 'skip'
export const Layers: Layers[] = ['map', 'forEach', 'break', 'continue', 'skip']

export type AllLayers = Layers | 'useNext' | 'useThis'
export const AllLayers: AllLayers[] = ['map', 'forEach', 'break', 'continue', 'skip', 'useNext', 'useThis']

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

/**UseNextLayer Middleware */
export interface UseNextLayer {
    /**Layer type */
    layer: 'useNext';
    /**Layer handler */
    handler: Function;
    /****this** arg for layer handler */
    thisArg: any;
    /**Indicates if handler is AsyncFunction */
    isAsync: boolean;
}

/**UseNextLayer Middleware */
export interface UseThisLayer {
    /**Layer type */
    layer: 'useThis';
    /**Layer handler */
    handler: Function;
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
    /**
     * Set the context - **this** for layers of EnhancedGeneratorFunction, before first iteration
     * > NOTE: Only the last **useThis** will be executed
     */
    useThis<U extends any = unknown>(callbackfn: () => U): AsyncEnhancedGeneratorFunction<T, R, N, C>
    /**
     * Modifie argument of **next(arg)** call, before each iteration. It will skip the very first call of **next(arg)**
     * > NOTE: **useNext**`s will be called in provided order, last result will be taken. 
     */
    useNext<U extends N, O extends N>(callbackfn: (value: T, index: number, next: N, lastUseNexts: O[]) => U, thisArg?: any): AsyncEnhancedGeneratorFunction<T, R, N, C>
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
    /**
     * Set the context - **this** for layers of EnhancedGeneratorFunction, before first iteration
     * > NOTE: Only the last **useThis** will be executed
     */
    useThis<U extends any = unknown>(callbackfn: () => U):
        U extends Promise<any> ? AsyncEnhancedGeneratorFunction<T, R, N, C>
        : EnhancedGeneratorFunction<T, R, N, C>;
    /**
     * Modifie argument of **next(arg)** call, before each iteration. It will skip the very first call of **next(arg)**
     * > NOTE: **useNext**`s will be called in provided order, last result will be taken. 
     */
    useNext<U extends N, O extends N>(callbackfn: (value: T, index: number, next: N, lastUseNexts: O[]) => U, thisArg?: any):
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
    ) & {
        [SymbolLayers]: Layer[];
        [SymbolUseNext]: UseNextLayer[];
        [SymbolUseThis]?: UseThisLayer;
    };

export const enhance: Enhance = function (generatorFunction) {
    const layers: Layer[] = []
    const originalGenFunc = generatorFunction

    const isOriginalAsync = isAsyncGeneratorFunction(originalGenFunc)
    const isOriginalSync = isGeneratorFunction(originalGenFunc)
    if (!isOriginalSync && !isOriginalAsync) {
        throw new Error('Please Provide (sync/async)GeneratorFunction, promise returning(yielding) functions PREFERED TO be specified with async keyword')
    }

    return initEnhancedGeneratorFunction(originalGenFunc, layers, [], undefined, isOriginalAsync, isOriginalAsync) as any
}

// Layer Inserters created ones -
const layerInserters: {
    [P in AllLayers]: (this: EnhancedGeneratorFunctionPrivate, cb: Function, thisArg?: any) => EnhancedGeneratorFunctionPrivate;
} = {} as any

for (const layer of AllLayers) {
    layerInserters[layer] = function (handler, thisArg) {
        const originalGenFunc = this[SymbolGenFunc]

        const isLayerAsync = isAsyncFunction(handler)
        const isLayerSync = isFunction(handler)
        if (!isLayerSync && !isLayerAsync) {
            throw new Error('Please Provide (sync/async)Function, promise returning functions PREFERED TO be specified with async keyword')
        }
        let layers = this[SymbolLayers]
        let useNextLayers = this[SymbolUseNext]
        let useThisLayer = this[SymbolUseThis]

        switch (layer) {
            case 'useThis':
                useThisLayer = {
                    layer,
                    handler,
                    isAsync: isLayerAsync,
                }
                break
            case 'useNext':
                useNextLayers = [...this[SymbolUseNext], {
                    layer,
                    handler,
                    thisArg,
                    isAsync: isLayerAsync,
                }]
                break
            default:
                layers = [...this[SymbolLayers], {
                    layer,
                    handler,
                    thisArg,
                    isAsync: isLayerAsync,
                }]
        }

        return initEnhancedGeneratorFunction(originalGenFunc, layers, useNextLayers, useThisLayer, this.isOriginalAsync, this.isAsync || isLayerAsync)
    }
}


function initEnhancedGeneratorFunction(
    originalGenFunc: (...args: any) => Generator | AsyncGenerator,
    layers: Layer[],
    useNextLayers: UseNextLayer[],
    useThisLayer: UseThisLayer | undefined,
    isOriginalAsync: boolean,
    isAsync: boolean,
): EnhancedGeneratorFunctionPrivate {
    let enhancedGeneratorFunction: EnhancedGeneratorFunctionPrivate = function* (this: any, ...args: any[]) {
        const gen = enhancedGeneratorFunctionSketch.call(
            this,
            originalGenFunc,
            layers,
            useNextLayers,
            useThisLayer,
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
                useNextLayers,
                useThisLayer,
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
    for (const layer of AllLayers) {
        enhancedGeneratorFunction[layer] = layerInserters[layer] as any
    }

    Object.defineProperty(enhancedGeneratorFunction, SymbolLayers, {
        value: layers,
    })
    Object.defineProperty(enhancedGeneratorFunction, SymbolGenFunc, {
        value: originalGenFunc,
    })
    Object.defineProperty(enhancedGeneratorFunction, SymbolUseThis, {
        value: useThisLayer,
    })
    Object.defineProperty(enhancedGeneratorFunction, SymbolUseNext, {
        value: useNextLayers,
    })
    Object.defineProperties(enhancedGeneratorFunction, {
        isEnhancedGeneratorFunction: { enumerable: false },
        isOriginalAsync: { enumerable: false },
        isAsync: { enumerable: false },
        layers: {
            enumerable: false,
            get() {
                return this[SymbolLayers].map((layer: any) => ({
                    ...layer,
                    thisArg: layer.thisArg !== null && layer.thisArg !== undefined ? true : false
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
        useThis: { enumerable: false },
        useNext: { enumerable: false },
    })
    return enhancedGeneratorFunction
}

function enhancedGeneratorFunctionSketch(
    this: any,
    originalGenFunc: (...args: any) => Generator | AsyncGenerator,
    layers: Layer[],
    useNextLayers: UseNextLayer[],
    useThisLayer: UseThisLayer | undefined,
    originalGenFuncCallArgs: any[],
    isOriginalAsync: boolean,
    isAsync: boolean,
) {
    const gen = originalGenFunc.apply(this, originalGenFuncCallArgs) as any

    if (isAsync) {
        return (async function* () {
            const globalThis = useThisLayer ?
                (useThisLayer.isAsync ? await useThisLayer.handler() : useThisLayer.handler())
                : undefined

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
                    const callContext = thisArg ?? globalThis
                    const handlerResult = isAsync ? await handler.call(callContext, modifiedNextVal, index) : handler.call(callContext, modifiedNextVal, index)
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
                    let modifiedNextArg = nextArg
                    const lastUseNexts = []
                    for (const { handler, thisArg, isAsync } of useNextLayers) {
                        const callContext = thisArg ?? globalThis
                        modifiedNextArg = isAsync ? await handler(callContext, modifiedNextVal, index + 1, nextArg, lastUseNexts) : handler(callContext, modifiedNextVal, index + 1, nextArg, lastUseNexts)
                        lastUseNexts.push(modifiedNextArg)
                    }
                    nextArg = modifiedNextArg
                }
                index++
            }
        })()
    }

    const syncGen = gen as Generator<unknown, any, unknown>
    return (function* () {
        const globalThis = useThisLayer ?
            useThisLayer.handler()
            : undefined

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
                const callContext = thisArg ?? globalThis
                const handlerResult = handler.call(callContext, modifiedNextVal, index)
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
                let modifiedNextArg = nextArg
                const lastUseNexts = []
                for (const { handler, thisArg } of useNextLayers) {
                    const callContext = thisArg ?? globalThis
                    modifiedNextArg = handler(callContext, modifiedNextVal, index + 1, nextArg, lastUseNexts)
                    lastUseNexts.push(modifiedNextArg)
                }
                nextArg = modifiedNextArg
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