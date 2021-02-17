const { expect } = require('chai')
const {
    isAsyncGenerator,
    isGenerator,
    isAsyncGeneratorFunction,
    isGeneratorFunction,
    isAsyncFunction,
    isFunction,

    sleep,
} = require('./utils')


const { enhance } = require('../dist')

describe('enhance', function () {
    const genFunc = function* () {
        yield 1
        yield 2
        yield 3
        return 'hey'
    }
    const genFuncAsync = async function* () {
        yield 1
        await sleep(100)
        yield 2
        await sleep(200)
        yield 3
        return 'hey'
    }
    const values = [1, 2, 3]
    const returnedValue = 'hey'

    describe('Returned Value', function () {
        const methods = ['map', 'forEach', 'some', 'every', 'find', 'findIndex']

        const enhancedSyncSingle = enhance(genFunc)
        const enhancedAsyncSingle = enhance(genFuncAsync)
        const enhancedSingles = [
            enhancedSyncSingle,
            enhancedAsyncSingle,
        ]

        specify('#isEnhancedGeneratorFunction', function () {
            expect(enhancedSyncSingle.isEnhancedGeneratorFunction)
                .to.be.true
        })
        specify('#isOriginalAsync', function () {
            expect(enhancedSyncSingle.isOriginalAsync)
                .to.be.false
            expect(enhancedAsyncSingle.isOriginalAsync)
                .to.be.true
        })
        specify('#isAsync', function () {
            expect(enhancedSyncSingle.isAsync)
                .to.be.false
            expect(enhancedAsyncSingle.isAsync)
                .to.be.true
        })

        it(`Should include additional enhance methods: ${methods}`, function () {
            for (let i = 0; i < enhancedSingles.length; i++) {
                const enhanced = enhancedSingles[i]
                for (const method of methods) {
                    expect(isFunction(enhanced[method]), `enhanced Must have method: #${method}`)
                        .to.be.true
                }
            }
        })


        context('If argument is instance of GeneratorFunction', function () {
            it('Should be instance of GeneratorFunction', function () {
                expect(isGeneratorFunction(enhancedSyncSingle), 'Must return GeneratorFunction instance')
                    .to.be.true
            })
        })

        context('If argument is instance of AsyncGeneratorFunction', function () {
            it('Should be instance of AsyncGeneratorFunction', function () {
                expect(isAsyncGeneratorFunction(enhancedAsyncSingle), 'Must return AsyncGeneratorFunction instance')
                    .to.be.true
            })
        })

        describe('Methods', function () {
            const enhancedSync = enhancedSyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .some((v => v))
                .every(v => 2)
                .find(v => 2)
                .findIndex(v => 2)
                .some(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncOriginal = enhancedAsyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .some((v => v))
                .every(v => 2)
                .find(v => 2)
                .map(v => v)
                .findIndex(v => 2)
                .some(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncMiddle = enhancedSyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .some((v => v))
                .every(v => 2)
                .find(v => 2)
                .map(async v => v)
                .findIndex(v => 2)
                .some(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncOriginalMiddle = enhancedAsyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .some((v => v))
                .every(v => 2)
                .find(v => 2)
                .map(async v => v)
                .findIndex(v => 2)
                .some(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)

            const enhancedAsyncEnd = enhancedSync
                .map(async v => v)
            const enhancedAsyncMiddleEnd = enhancedAsyncMiddle
                .map(async v => v)
            const enhancedAsyncOriginalEnd = enhancedAsyncOriginal
                .map(async v => v)
            const enhancedAsyncOriginalMiddleEnd = enhancedAsyncOriginalMiddle
                .map(async v => v)
            const enhancedChains = [
                enhancedSync,

                enhancedAsyncOriginal,
                enhancedAsyncMiddle,
                enhancedAsyncOriginalMiddle,

                enhancedAsyncEnd,
                enhancedAsyncMiddleEnd,
                enhancedAsyncOriginalEnd,
                enhancedAsyncOriginalMiddleEnd,
            ]

            describe('Returned Value', function () {
                specify('#isEnhancedGeneratorFunction', function () {
                    for (let i = 0; i < enhancedChains.length; i++) {
                        const enhanced = enhancedChains[i]
                        expect(enhanced.isEnhancedGeneratorFunction, 'isEnhancedGeneratorFunction should be true')
                            .to.be.true
                    }
                })
                specify('#isOriginalAsync', function () {
                    expect(enhancedSync.isOriginalAsync)
                        .to.be.false

                    expect(enhancedAsyncOriginal.isOriginalAsync)
                        .to.be.true
                    expect(enhancedAsyncMiddle.isOriginalAsync)
                        .to.be.false
                    expect(enhancedAsyncOriginalMiddle.isOriginalAsync)
                        .to.be.true

                    expect(enhancedAsyncEnd.isOriginalAsync)
                        .to.be.false
                    expect(enhancedAsyncMiddleEnd.isOriginalAsync)
                        .to.be.false
                    expect(enhancedAsyncOriginalEnd.isOriginalAsync)
                        .to.be.true
                    expect(enhancedAsyncOriginalMiddleEnd.isOriginalAsync)
                        .to.be.true
                })
                specify('#isAsync', function () {
                    expect(enhancedSync.isAsync)
                        .to.be.false

                    expect(enhancedAsyncOriginal.isAsync)
                        .to.be.true
                    expect(enhancedAsyncMiddle.isAsync)
                        .to.be.true
                    expect(enhancedAsyncOriginalMiddle.isAsync)
                        .to.be.true

                    expect(enhancedAsyncEnd.isAsync)
                        .to.be.true
                    expect(enhancedAsyncMiddleEnd.isAsync)
                        .to.be.true
                    expect(enhancedAsyncOriginalEnd.isAsync)
                        .to.be.true
                    expect(enhancedAsyncOriginalMiddleEnd.isAsync)
                        .to.be.true
                })

                it(`Should include additional enhance methods: ${methods}`, function () {
                    for (let i = 0; i < enhancedChains.length; i++) {
                        const enhanced = enhancedChains[i]
                        for (const method of methods) {
                            expect(isFunction(enhanced[method]), `enhanced Must have method: #${method}`)
                                .to.be.true
                        }
                    }
                })

            })

            describe('If chain`s original generator function is synchronous and it not contains async layers', function () {
                it('Should be instance of GeneratorFunction', function () {
                    const enhanced = enhancedSync
                    expect(isGeneratorFunction(enhanced))
                        .to.be.true
                })
            })

            describe('If chain contains async layers or async original generator function', function () {
                const asyncChains = [
                    enhancedAsyncOriginal,
                    enhancedAsyncMiddle,
                    enhancedAsyncOriginalMiddle,

                    enhancedAsyncEnd,
                    enhancedAsyncMiddleEnd,
                    enhancedAsyncOriginalEnd,
                    enhancedAsyncOriginalMiddleEnd,
                ]

                it('Should be instance of AsyncGeneratorFunction', function () {
                    for (const enhanced of asyncChains) {
                        expect(isAsyncGeneratorFunction(enhanced))
                            .to.be.true
                    }
                })
            })

            describe('behaviour', function () {
                const syncLayers = [
                    {
                        type: 'map',
                        func: (v, i) => {
                            expect(v).to.be.eq(values[i])
                            return v + 10
                        }
                    },
                    {
                        type: 'every',
                        func: v => true
                    },
                    {
                        type: 'forEach',
                        func: (v, i) => {
                            const o = 10 + 10
                            expect(v).to.be.eq(values[i] + 10)
                            // console.log('Testing Map')
                        }
                    },
                    {
                        type: 'findIndex',
                        func: v => false
                    },
                    {
                        type: 'some',
                        func: (v, i) => {
                            // console.log(v, i)
                            // console.log(values)
                            expect(v).to.be.eq(values[i] + 10)
                            return false
                        }
                    },
                ]
                const asyncLayers = [
                    {
                        type: 'map',
                        func: async (v, i) => {
                            expect(v).to.be.eq(values[i] + 10)
                            return Promise.resolve(v + 10)
                        }
                    },
                    {
                        type: 'find',
                        func: (v, i) => {
                            expect(v).to.be.eq(values[i] + 20)
                            return false
                        }
                    },
                    {
                        type: 'map',
                        func: (v, i) => {
                            expect(v).to.be.eq(values[i] + 20)
                            return v + 10
                        }
                    },
                ]
                const enhancedSync = syncLayers.reduce((enhanced, layer) => enhanced[layer.type](layer.func), enhancedSyncSingle)
                const enhancedSyncToAsync = asyncLayers.reduce((enhanced, layer) => enhanced[layer.type](layer.func), enhancedSync)
                const enhancedAsync = syncLayers.reduce((enhanced, layer) => enhanced[layer.type](layer.func), enhancedAsyncSingle)
                const enhancedAsyncToAsync = asyncLayers.reduce((enhanced, layer) => enhanced[layer.type](layer.func), enhancedAsync)

                describe('#some', function () {
                    it('Short circuit when truthy value returned', async function () {
                        let gen = enhancedSync
                            .some((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let i = 0
                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedSync
                            .some(async (v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedAsync
                            .some((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)
                    })
                })

                describe('#every', function () {
                    it('Short circuit when truthy value returned', async function () {
                        let gen = enhancedSync
                            .every((v, i) => {
                                return i === 1 ? false : true
                            })
                            .map(v => v + 10)()


                        let i = 0
                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedSync
                            .every(async (v, i) => {
                                return i === 1 ? false : true
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedAsync
                            .every((v, i) => {
                                return i === 1 ? false : true
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)
                    })
                })

                describe('#find', function () {
                    it('Short circuit when truthy value returned', async function () {
                        let gen = enhancedSync
                            .find((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let i = 0
                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedSync
                            .find(async (v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)

                        gen = enhancedAsync
                            .find((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 12, i.e. last maping of iteration must not be performed`).to.be.eq(12)
                    })
                })
                
                describe('#findIndex', function () {
                    it('Short circuit when truthy value returned', async function () {
                        let gen = enhancedSync
                            .findIndex((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let i = 0
                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 1, i.e. last maping of iteration must not be performed`).to.be.eq(1)

                        gen = enhancedSync
                            .findIndex(async (v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 1, i.e. last maping of iteration must not be performed`).to.be.eq(1)

                        gen = enhancedAsync
                            .findIndex((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        i = 0
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            i++
                            yieldVal = await gen.next()
                        }
                        expect(i, `Must short circuit on index: 1`).to.be.eq(1)
                        expect(yieldVal.value, `value must be 1, i.e. last maping of iteration must not be performed`).to.be.eq(1)
                    })
                })

                describe('#map', function () {
                    context('When original is GeneratorFunction', function () {
                        it('Should correctly map values and set next layer call arguments', async function () {
                            let i = 0
                            for (const val of enhancedSync()) {
                                expect(val).to.be.eq(values[i] + 10)
                                i++
                            }

                            i = 0
                            for await (const val of enhancedSyncToAsync()) {
                                expect(val).to.be.eq(values[i] + 30)
                                i++
                            }
                        })
                        it('Should not chainge return values', async function () {
                            let gen = enhancedSync()

                            let yieldVal = gen.next()
                            while (!yieldVal.done) {
                                yieldVal = gen.next()
                            }
                            let returnedValue = yieldVal.value
                            expect(returnedValue).to.be.eq('hey')

                            // // // When some is async
                            gen = enhancedSyncToAsync()

                            yieldVal = await gen.next()
                            while (!yieldVal.done) {
                                yieldVal = await gen.next()
                            }
                            returnedValue = yieldVal.value
                            expect(returnedValue).to.be.eq('hey')
                        })
                    })

                    context('When origina is AsyncGeneratorFunction', function () {
                        it('Should correctly map values and set next layer call arguments', async function () {
                            let i = 0
                            for await (const val of enhancedAsync()) {
                                expect(val).to.be.eq(values[i] + 10)
                                i++
                            }

                            i = 0
                            for await (const val of enhancedAsyncToAsync()) {
                                expect(val).to.be.eq(values[i] + 30)
                                i++
                            }
                        })
                        it('Should not chainge return values', async function () {
                            let gen = enhancedAsync()

                            let yieldVal = await gen.next()
                            while (!yieldVal.done) {
                                yieldVal = await gen.next()
                            }
                            let returnedValue = yieldVal.value
                            expect(returnedValue).to.be.eq('hey')

                            // // // When some is async
                            gen = enhancedAsyncToAsync()

                            yieldVal = await gen.next()
                            while (!yieldVal.done) {
                                yieldVal = await gen.next()
                            }
                            returnedValue = yieldVal.value
                            expect(returnedValue).to.be.eq('hey')
                        })
                    })
                })
            })
        })
    })
})


// function 