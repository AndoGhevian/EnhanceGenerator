interface Enhance {
    <T, R, N, C extends any[]>(generatorFunction: (...args: [...C]) => Generator<T, R, N>): EnhancedGeneratorFunction<T, R, N, C>;
}

interface EnhancedGeneratorFunction<T = any, R = any, N = any, C extends any[] = any[]> {
    readonly isEnhancedGeneratorFunction: true;

    map<U>(callbackfn: (value: T, index: number, items: U[], notModifiedItems: T[]) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C>;
    forEach<U>(callbackfn: (value: T, index: number, items: T[], notModifiedItems: T[]) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C>;
    some(predicate: (value: T, index: number, items: T[], notModifiedItems: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    every(predicate: (value: T, index: number, items: T[], notModifiedItems: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    indexOf(searchElement: T, fromIndex?: number): EnhancedGeneratorFunction<T, number | R, N, C>;
    find(predicate: (value: T, index: number, items: T[], notModifiedItems: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C>;
    findIndex(predicate: (value: T, index: number, items: T[], notModifiedItems: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C>;
    (...args: [...C]): Generator<T, R, N>;
}
type Layers = Exclude<keyof EnhancedGeneratorFunction, 'isEnhancedGeneratorFunction'>
const Layers: Layers[] = ['map', 'forEach', 'some', 'every', 'indexOf', 'find', 'findIndex']

const enhance: Enhance = function (generatorFunction) {
    const layers: {
        layerField: Layers
        layerHandler: Function;
        layerHandlerThisArg: any;
    }[] = []

    const enhanced = function* (this: any, ...args: any[]) {
        const layersCopy = [...layers]
        const gen = generatorFunction.apply(this, args as any)

        const items = []
        const notModifiedItems = []
        let index = 0
        while (true) {
            let nextVal!: IteratorResult<any, any>
            nextVal = gen.next()
            if (nextVal.done) return nextVal.value

            let val = nextVal.value
            notModifiedItems.push(val)
            for (const layer of enhancedGeneratorFunction.layers) {
                const layerResult = layer.layerHandler.call(layer.layerHandlerThisArg, val, index,)

                switch (layer.layerField) {
                    case 'map':
                        val = layerResult
                        break
                    case 'find':
                    case 'some':
                        if (layerResult === true) {
                            return val
                        }
                        break
                    case 'findIndex':
                        if (layerResult === true) {
                            return index
                        }
                        break
                    case 'indexOf'
                    case 'every':
                        if (layerResult !== true) {
                            return val
                        }
                        break
                    case 'forEach':
                    default:
                        break
                }
            }
        }
    } as any


    enhanced.isEnhancedGeneratorFunction = true
    for (const layerField of Layers) {
        enhanced[layerField] = function (layerHandler: Function, layerHandlerThisArg: any) {
            layers.push({
                layerField,
                layerHandler,
                layerHandlerThisArg
            })
        }
    }
    return enhanced as any
}



// New Version Sketch
// find(some(map(gen, cb, thisArg), cb, thisArg))
// enhance(gen)
//     .find().some().clone()
// enhanced.map(gen).clone()