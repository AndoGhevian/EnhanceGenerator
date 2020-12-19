import {
    EnhancedGeneratorFunctionPrivate,
    Layers,
    SymbolLayers,
} from "./lib"


// Layer Inserters created ones -
const layerInserters: {
    [P in Layers]: (this: EnhancedGeneratorFunctionPrivate, cb: Function, thisArg?: any) => EnhancedGeneratorFunctionPrivate
} = {} as any

for (const layer of Layers) {
    layerInserters[layer] = function (handler, thisArg) {
        this[SymbolLayers].push({
            layer,
            handler,
            thisArg
        })
        return this
    }
}


export default layerInserters