export const SymbolLayers = Symbol('SymbolLayers')
export type SymbolLayers = typeof SymbolLayers

export const SymbolGenFunc = Symbol('SymbolGenFunc')
export type SymbolGenFunc = typeof SymbolGenFunc

/**Middlware layer types */
export type Layers = Exclude<keyof EnhancedGeneratorFunction, 'isEnhancedGeneratorFunction'>
export const Layers: Layers[] = ['map', 'forEach', 'some', 'every', 'find', 'findIndex']

/**Middleware Layer */
export interface Layer {
    /**Layer type */
    layer: Layers;
    /**Layer handler */
    handler: Function;
    /****this** arg for layer handler */
    thisArg: any;
}

export interface Enhance {
    <T, R, N, C extends any[]>(generatorFunction: (...args: [...C]) => Generator<T, R, N>): EnhancedGeneratorFunction<T, R, N, C>;
}

export interface EnhancedGeneratorFunction<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> {
    isEnhancedGeneratorFunction: true;

    /**Map values to another ones, returned by callbackfn */
    map<U>(callbackfn: (value: T, index: number) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C>;
    /**Do some stuff on next call */
    forEach<U>(callbackfn: (value: T, index: number) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C>;
    /**If predicate return trithy value, GeneratorFunction will be returned with current value */
    some(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    /**If predicate return falsey value, GeneratorFunction will be returned with current value */
    every(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    /**If predicate return truthy value, GeneratorFunction will be returned with current value(Same as _some_) */
    find(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    /**If predicate return truthy value, GeneratorFunction will be returned with current yield index */
    findIndex(predicate: (value: T, index: number) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C>;
    (...args: [...C]): Generator<T, R, N>;
}
export interface EnhancedGeneratorFunctionPrivate<T = unknown, R = any, N = unknown, C extends any[] = unknown[]> extends EnhancedGeneratorFunction<T, R, N, C> {
    [SymbolLayers]: Layer[];
    [SymbolGenFunc]: (...args: any[]) => Generator;
}

// Layer Inserters created ones -
const layerInserters: {
    [P in Layers]: (this: EnhancedGeneratorFunctionPrivate, cb: Function, thisArg?: any) => EnhancedGeneratorFunctionPrivate;
} = {} as any

for (const layer of Layers) {
    layerInserters[layer] = function (handler, thisArg) {
        const layers: Layer[] = [...this[SymbolLayers], {
            layer,
            handler,
            thisArg
        }]
        const originalGenFunc = this[SymbolGenFunc]


        return initEnhancedGeneratorFunction(originalGenFunc, layers)
    }
}


export const enhance: Enhance = function (generatorFunction) {
    const layers: Layer[] = []
    const originalGenFunc = generatorFunction


    return initEnhancedGeneratorFunction(originalGenFunc, layers) as any
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