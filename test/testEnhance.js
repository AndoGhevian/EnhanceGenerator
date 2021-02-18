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
        const methods = ['map', 'forEach', 'break', 'continue', 'skip']

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
        specify('#layers read-only array', function () {
            for (let i = 0; i < enhancedSingles.length; i++) {
                const enhanced = enhancedSingles[i]
                const layers = enhanced.layers
                expect(layers)
                    .to.be.an('array')

                enhanced.layers = Array(100)
                expect(enhanced.layers.length)
                    .lengthOf.to.be.eq(layers.length)
            }
        })
        specify('#originalGeneratorFunction read-only GeneratorFunction/AsyncGeneratorFunction', function () {
            const enhanced = enhance(genFunc)
            const enhancedAsync = enhance(genFuncAsync)

            const originalGeneratorFunction = enhanced.originalGeneratorFunction
            const originalGeneratorFunctionAsync = enhancedAsync.originalGeneratorFunction

            expect(isGeneratorFunction(originalGeneratorFunction))
                .to.be.true
            expect(isAsyncGeneratorFunction(originalGeneratorFunctionAsync))
                .to.be.true

            enhanced.originalGeneratorFunction = function* () { }
            expect(enhanced.originalGeneratorFunction)
                .to.be.eq(originalGeneratorFunction)

            enhancedAsync.originalGeneratorFunction = function* () { }
            expect(enhancedAsync.originalGeneratorFunction)
                .to.be.eq(originalGeneratorFunctionAsync)
        })

        it(`Should include additional enhance methods: ${methods}`, function () {
            for (let i = 0; i < enhancedSingles.length; i++) {
                const enhanced = enhancedSingles[i]
                for (const method of methods) {
                    expect(isFunction(enhanced[method]), `Enhanced Must have method: #${method}`)
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
                .break((v => false))
                .continue(v => false)
                .break((v => false))
                .skip(v => false)
                .break(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncOriginal = enhancedAsyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .break((v => false))
                .continue(v => false)
                .break((v => false))
                .skip(v => false)
                .break(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncMiddle = enhancedSyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .break((v => false))
                .continue(v => false)
                .break((v => false))
                .map(async v => v)
                .skip(v => false)
                .break(v => v)
                .map(v => 2)
                .map(v => 2)
                .map(v => 2)
            const enhancedAsyncOriginalMiddle = enhancedAsyncSingle
                .map((v => v + 1))
                .forEach(v => 2)
                .break((v => false))
                .continue(v => false)
                .break((v => false))
                .map(async v => v)
                .skip(v => false)
                .break(v => v)
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
            const asyncChains = [
                enhancedAsyncOriginal,
                enhancedAsyncMiddle,
                enhancedAsyncOriginalMiddle,

                enhancedAsyncEnd,
                enhancedAsyncMiddleEnd,
                enhancedAsyncOriginalEnd,
                enhancedAsyncOriginalMiddleEnd,
            ]
            const originalSync = [
                enhancedSync,
                enhancedAsyncMiddle,

                enhancedAsyncEnd,
                enhancedAsyncMiddleEnd,
            ]
            const originalAsync = [
                enhancedAsyncOriginal,
                enhancedAsyncOriginalMiddle,

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
                    for (let i = 0; i < originalAsync.length; i++) {
                        const enhanced = originalAsync[i]

                        expect(enhanced.isOriginalAsync)
                            .to.be.true
                    }

                    // with original-synchronous EnhancedGeneratorFunctions
                    for (let i = 0; i < originalSync.length; i++) {
                        const enhanced = originalSync[i]
                        expect(enhanced.isOriginalAsync)
                            .to.be.false
                    }
                })
                specify('#isAsync', function () {
                    const enhanced = enhancedSync
                    expect(enhanced.isAsync)
                        .to.be.false

                    for (let i = 0; i < asyncChains.length; i++) {
                        const enhanced = asyncChains[i]

                        expect(enhanced.isAsync)
                            .to.be.true
                    }
                })
                specify('#layers read-only array', function () {
                    for (let i = 0; i < enhancedChains.length; i++) {
                        const enhanced = enhancedChains[i]
                        const layers = enhanced.layers
                        expect(layers)
                            .to.be.an('array')

                        enhanced.layers = Array(100)
                        expect(enhanced.layers.length)
                            .lengthOf.to.be.eq(layers.length)
                    }
                })
                specify('#originalGeneratorFunction read-only GeneratorFunction/AsyncGeneratorFunction', function () {
                    for (let i = 0; i < originalAsync.length; i++) {
                        const enhanced = originalAsync[i]
                        const originalGeneratorFunction = enhanced.originalGeneratorFunction

                        expect(isAsyncGeneratorFunction(originalGeneratorFunction), `Must be AsyncGeneratorFunction: ${i}`)
                            .to.be.true

                        enhanced.originalGeneratorFunction = async function* () { }
                        expect(enhanced.originalGeneratorFunction)
                            .to.be.eq(originalGeneratorFunction)
                    }

                    // with original-synchronous EnhancedGeneratorFunctions
                    for (let i = 0; i < originalSync.length; i++) {
                        const enhanced = originalSync[i]
                        const originalGeneratorFunction = enhanced.originalGeneratorFunction

                        expect(isGeneratorFunction(originalGeneratorFunction), `Must be GeneratorFunction`)
                            .to.be.true

                        enhanced.originalGeneratorFunction = function* () { }
                        expect(enhanced.originalGeneratorFunction)
                            .to.be.eq(originalGeneratorFunction)
                    }
                })

                it(`Should include additional enhance methods: ${methods}`, function () {
                    for (let i = 0; i < enhancedChains.length; i++) {
                        const enhanced = enhancedChains[i]
                        for (const method of methods) {
                            expect(isFunction(enhanced[method]), `Enhanced Must have method: #${method}`)
                                .to.be.true
                        }
                    }
                })

                describe('If chain`s original generator function is synchronous and it not contains async layers', function () {
                    it('Should be instance of GeneratorFunction', function () {
                        const enhanced = enhancedSync
                        expect(isGeneratorFunction(enhanced))
                            .to.be.true
                    })
                })

                describe('If chain contains async layers or async original generator function', function () {
                    it('Should be instance of AsyncGeneratorFunction', function () {
                        for (const enhanced of asyncChains) {
                            expect(isAsyncGeneratorFunction(enhanced))
                                .to.be.true
                        }
                    })
                })
            })

            describe('Behaviour', function () {
                describe('#continue', function () {
                    it('Should skip rest of layers chain, YIELD current value, and continue generation', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .continue((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let resultVals = []
                        for (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[1] + 10)
                        expect(resultVals[2]).to.be.eq(values[2] + 20)

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .continue(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[1] + 10)
                        expect(resultVals[2]).to.be.eq(values[2] + 20)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .continue(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[1] + 10)
                        expect(resultVals[2]).to.be.eq(values[2] + 20)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .continue((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[1] + 10)
                        expect(resultVals[2]).to.be.eq(values[2] + 20)
                    })
                })

                describe('#skip', function () {
                    it('Should skip rest of layers chain, SKIP YIELD of current value, and continue generation', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .skip((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let resultVals = []
                        for (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length - 1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[2] + 20)

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .skip(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length - 1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[2] + 20)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .skip(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length - 1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[2] + 20)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .skip((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        resultVals = []
                        for await (const v of gen) {
                            resultVals.push(v)
                        }
                        expect(resultVals).to.be.lengthOf(values.length - 1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(resultVals[1]).to.be.eq(values[2] + 20)
                    })
                })

                describe('#break', function () {
                    it('Break EnhancedGenerator when truthy value returned', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        let resultVals = []
                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            resultVals.push(yieldVal.value)
                            yieldVal = gen.next()
                        }

                        expect(resultVals).to.be.lengthOf(1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(yieldVal.value).to.be.eq(values[1] + 10)

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            resultVals.push(yieldVal.value)
                            yieldVal = await gen.next()
                        }

                        expect(resultVals).to.be.lengthOf(1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(yieldVal.value).to.be.eq(values[1] + 10)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => {
                                return i === 1
                            })
                            .map(async v => v + 10)()


                        resultVals = []
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            resultVals.push(yieldVal.value)
                            yieldVal = await gen.next()
                        }

                        expect(resultVals).to.be.lengthOf(1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(yieldVal.value).to.be.eq(values[1] + 10)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break((v, i) => {
                                return i === 1
                            })
                            .map(v => v + 10)()


                        resultVals = []
                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            resultVals.push(yieldVal.value)
                            yieldVal = await gen.next()
                        }

                        expect(resultVals).to.be.lengthOf(1)
                        expect(resultVals[0]).to.be.eq(values[0] + 20)
                        expect(yieldVal.value).to.be.eq(values[1] + 10)
                    })

                    it('Not Break EnhancedGenerator when falsy value returned', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()


                        let i = 0
                        for (const v of gen) {
                            expect(v).to.be.eq(values[i] + 20)
                            i++
                        }

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()


                        i = 0
                        for await (const v of gen) {
                            expect(v).to.be.eq(values[i] + 20)
                            i++
                        }

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()


                        i = 0
                        for await (const v of gen) {
                            expect(v).to.be.eq(values[i] + 20)
                            i++
                        }

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()


                        i = 0
                        for await (const v of gen) {
                            expect(v).to.be.eq(values[i] + 20)
                            i++
                        }
                    })
                })

                describe('#map', function () {
                    it('Should correctly map values', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()

                        let i = 0
                        for (const val of gen) {
                            expect(val).to.be.eq(values[i] + 20)
                            i++
                        }
                        expect(i).to.be.eq(values.length)

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()

                        i = 0
                        for await (const val of gen) {
                            expect(val).to.be.eq(values[i] + 20)
                            i++
                        }
                        expect(i).to.be.eq(values.length)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()

                        i = 0
                        for await (const val of gen) {
                            expect(val).to.be.eq(values[i] + 20)
                            i++
                        }
                        expect(i).to.be.eq(values.length)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()

                        i = 0
                        for await (const val of gen) {
                            expect(val).to.be.eq(values[i] + 20)
                            i++
                        }
                        expect(i).to.be.eq(values.length)
                    })
                    it('Should not chainge return values', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()


                        let yieldVal = gen.next()
                        while (!yieldVal.done) {
                            yieldVal = gen.next()
                        }

                        currentReturnedValue = yieldVal.value
                        expect(currentReturnedValue).to.be.eq(returnedValue)

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()


                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            yieldVal = await gen.next()
                        }

                        currentReturnedValue = yieldVal.value
                        expect(currentReturnedValue).to.be.eq(returnedValue)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break(async (v, i) => false)
                            .map(async v => v + 10)()


                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            yieldVal = await gen.next()
                        }

                        currentReturnedValue = yieldVal.value
                        expect(currentReturnedValue).to.be.eq(returnedValue)

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .break((v, i) => false)
                            .map(v => v + 10)()


                        yieldVal = await gen.next()
                        while (!yieldVal.done) {
                            yieldVal = await gen.next()
                        }
                        currentReturnedValue = yieldVal.value
                        expect(currentReturnedValue).to.be.eq(returnedValue)
                    })
                    it('Should correctly set next layer call arguments', async function () {
                        let gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .skip((v, i) => {
                                expect(v).to.be.eq(values[i] + 10)
                                return false
                            })
                            .map(v => v + 10)()


                        for (const _ of gen);

                        gen = enhancedSyncSingle
                            .map(v => v + 10)
                            .skip(async (v, i) => {
                                expect(v).to.be.eq(values[i] + 10)
                                return false
                            })
                            .map(async v => v + 10)()


                        for await (const _ of gen);

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .skip(async (v, i) => {
                                expect(v).to.be.eq(values[i] + 10)
                                return false
                            })
                            .map(async v => v + 10)()


                        for await (const _ of gen);

                        gen = enhancedAsyncSingle
                            .map(v => v + 10)
                            .skip((v, i) => {
                                expect(v).to.be.eq(values[i] + 10)
                                return false
                            })
                            .map(v => v + 10)()


                        for await (const _ of gen);
                    })
                })
            })
        })
    })
})