declare function enhance<T, R, N, C extends any[],>(generatorFunction: (...args: [...C]) => Generator<T, R, N>): EnhancedGeneratorFunction<T, R, N, C>;


type ExtendLayer<T, L extends any[]> = [...L, T]
type BuildEnhancedGenerator<T, R, N, TValue, TLayerIndex extends number, TField extends 'some' | 'every' | 'indexOf' | 'find' | 'findIndex' | 'map' | 'forEach' | undefined> = {
    terminationField: TField;
    terminationIndex: TLayerIndex;
    terminationValue: TValue;
} & Generator<T, R, N>

interface InitialEnhancedGenerator<T, R, N> extends Generator<T, R, N> {
    terminationField: undefined;
    terminationIndex: 0;
    terminationValue: R;
}
interface MutationEnhancedGenerator<T, R, N> extends Generator<T, R, N> {
    terminationField: 'map' | 'forEach';
    terminationIndex: number;
    terminationValue: never;
}
interface DesigionEnhancedGenerator<T, R, N, TValue = any> extends Generator<T, R, N> {
    terminationField: 'some' | 'every' | 'indexOf' | 'find' | 'findIndex';
    terminationIndex: number;
    terminationValue: TValue;
}
type EnhancedGenerator<T, R, N, TValue = unknown> = InitialEnhancedGenerator<T, R, N>
    | MutationEnhancedGenerator<T, R, N>
    | DesigionEnhancedGenerator<T, R, N, TValue>


interface EnhancedGeneratorFunction<T, R, N, C extends any[],
    TLayer extends any[] = [R],
    TEnhancedGenerator extends EnhancedGenerator<any, any, any> = BuildEnhancedGenerator<T, R, N, R, 0, undefined>> {
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): EnhancedGeneratorFunction<U, R, N, C,
        [...TLayer, never],
        TEnhancedGenerator | BuildEnhancedGenerator<U, R, N, never, TLayer['length'], 'map'>>
    forEach<U>(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): EnhancedGeneratorFunction<T, R, N, C,
        [...TLayer, never],
        TEnhancedGenerator | BuildEnhancedGenerator<T, R, N, never, TLayer['length'], 'forEach'>>
    some(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'some'>>
    every(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'every'>>
    indexOf(searchElement: T, fromIndex?: number): EnhancedGeneratorFunction<T, number | R, N, C,
        [...TLayer, number],
        TEnhancedGenerator | BuildEnhancedGenerator<T, number | R, N, number, TLayer['length'], 'indexOf'>>
    find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, T | R, N, C,
        [...TLayer, T],
        TEnhancedGenerator | BuildEnhancedGenerator<T, T | R, N, T, TLayer['length'], 'find'>>
    findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): EnhancedGeneratorFunction<T, number | R, N, C,
        [...TLayer, number],
        TEnhancedGenerator | BuildEnhancedGenerator<T, number | R, N, number, TLayer['length'], 'findIndex'>>
    (...args: [...C]): TEnhancedGenerator
}