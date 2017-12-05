const { Observable } = require('../observable');

describe('operators', () => {
    const fakeObserver = {
        next: jest.fn(),
        complete: jest.fn(),
        error: jest.fn(),
    };
    const intervalObservables = [
        Observable.interval(2)
            .map(value => value + 10)
            .take(3),
        Observable.interval(3)
            .map(value => value + 20)
            .take(3),
        Observable.interval(5)
            .map(value => value + 30)
            .take(3),
    ];

    let fakeHigherOrderObservable;

    beforeEach(() => {
        Object.keys(fakeObserver).forEach(key => {
            fakeObserver[key].mockClear();
        });

        fakeHigherOrderObservable = Observable.of(1, 2, 3).map(
            index => intervalObservables[index],
        );
    });

    describe('.map()', () => {
        it('returns an Observable', () => {
            expect(Observable.of(1, 2, 3).map(x => x)).toBeInstanceOf(
                Observable,
            );
        });

        it("requires a function as a parameter (throws if it isn't)", () => {
            const fakeObservable = Observable.of(1, 2, 3);

            expect(() => fakeObservable.map(1)).toThrow();
            expect(() => fakeObservable.map(true)).toThrow();
            expect(() => fakeObservable.map({ a: 1, b: false })).toThrow();
            expect(() => fakeObservable.map(null)).toThrow();
            expect(() => fakeObservable.map()).toThrow();
        });

        it('emits results of the projection function invoked with consecutive values of the parent Observable', () => {
            const fakeObservable = Observable.of(1, 2, 3);
            const projection = value => value + 10;

            fakeObservable.map(projection).subscribe(fakeObserver);

            expect(fakeObserver.next.mock.calls.length).toBe(3);
            expect(fakeObserver.next.mock.calls[0][0]).toBe(11);
            expect(fakeObserver.next.mock.calls[1][0]).toBe(12);
            expect(fakeObserver.next.mock.calls[2][0]).toBe(13);
        });

        it("calls the projection function on every parent Observable's emited value", () => {
            const fakeObservable = Observable.of(1, 2, 3);
            const projection = jest.fn(value => value + 10);

            fakeObservable.map(projection).subscribe(fakeObserver);

            expect(projection).toHaveBeenCalledTimes(3);
        });

        it('completes when the parent Observable does', () => {
            const fakeObservable = Observable.of(1, 2, 3);
            const projection = value => value + 10;

            fakeObservable.map(projection).subscribe(fakeObserver);

            expect(fakeObserver.next).toHaveBeenCalledTimes(3);
            expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        });

        it('emits an error if any error occures inside the projection function', () => {
            const fakeObservable = Observable.of(1, 2, 3);
            const projection = value => {
                if (value % 2 === 0) {
                    throw new Error('Oops!');
                }

                return value + 10;
            };

            fakeObservable.map(projection).subscribe(fakeObserver);

            expect(fakeObserver.next).toHaveBeenCalledTimes(1); // @todo: czy nie 2?
            expect(fakeObserver.error).toHaveBeenCalledTimes(1);
            expect(fakeObserver.error).toHaveBeenCalledWith('Oops!'); // czy nie cały obiekt błędu?
        });

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = Observable.of(1, 2, 3).map(v => v);

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });

    describe('concat()', () => {
        beforeEach(() => {
            jest.clearAllTimers();
            jest.useFakeTimers();
        });

        it('returns an Observable', () => {
            expect(fakeHigherOrderObservable.concat()).toBeInstanceOf(
                Observable,
            );
        });

        it('emits values of the first inner Observable, then second etc.', () => {
            fakeHigherOrderObservable.subscribe(fakeObserver);

            jest.runTimersToTime(6);
            expect(fakeObserver.next.mock.calls.length).toBe(3);
            expect(fakeObserver.next.mock.calls[0][0]).toBe(10);
            expect(fakeObserver.next.mock.calls[1][0]).toBe(11);
            expect(fakeObserver.next.mock.calls[2][0]).toBe(12);

            jest.runTimersToTime(15);
            expect(fakeObserver.next.mock.calls.length).toBe(6);
            expect(fakeObserver.next.mock.calls[3][0]).toBe(20);
            expect(fakeObserver.next.mock.calls[4][0]).toBe(21);
            expect(fakeObserver.next.mock.calls[5][0]).toBe(22);

            jest.runTimersToTime(30);
            expect(fakeObserver.next.mock.calls.length).toBe(9);
            expect(fakeObserver.next.mock.calls[6][0]).toBe(30);
            expect(fakeObserver.next.mock.calls[7][0]).toBe(31);
            expect(fakeObserver.next.mock.calls[8][0]).toBe(32);
        });

        it('completes when all inner Observables complete', () => {
            fakeHigherOrderObservable.subscribe(fakeObserver);

            jest.runTimersToTime(6);
            expect(fakeObserver.complete).not.toHaveBeenCalled();

            jest.runTimersToTime(15);
            expect(fakeObserver.complete).not.toHaveBeenCalled();

            jest.runTimersToTime(30);
            expect(fakeObserver.complete).toHaveBeenCalled();
        });

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = fakeHigherOrderObservable.concat();

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });

    describe('concat()', () => {
        // beforeEach(() => {
        //     jest.clearAllTimers();
        //     jest.useFakeTimers();
        // });
        // it('returns an Observable', () => {
        //     const fakeObservable = Observable.interval(200);
        //     expect(fakeObservable.take(3)).toBeInstanceOf(Observable);
        // });
        // it('passes through values unchanged', () => {
        //     const fakeObservable = Observable.interval(10).take(3);
        //     fakeObservable.subscribe(fakeObserver);
        //     jest.runTimersToTime(100);
        //     expect(fakeObserver.next.mock.calls[0][0]).toBe(0);
        //     expect(fakeObserver.next.mock.calls[1][0]).toBe(1);
        //     expect(fakeObserver.next.mock.calls[2][0]).toBe(2);
        // });
        // it('emits only specified amount of values emited first by the parent Observable', () => {
        //     const fakeObservable = Observable.interval(10).take(3);
        //     fakeObservable.subscribe(fakeObserver);
        //     jest.runTimersToTime(100);
        //     expect(fakeObserver.next).toHaveBeenCalledTimes(3);
        // });
        // it('completes immediately if 0 is passed', () => {
        //     const fakeObservable = Observable.interval(10).take(0);
        //     fakeObservable.subscribe(fakeObserver);
        //     jest.runTimersToTime();
        //     expect(fakeObserver.next).toHaveBeenCalledTimes(0);
        //     expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        // });
        // it('completes after emiting specified amount of values', () => {
        //     const fakeObservable = Observable.interval(10).take(3);
        //     fakeObservable.subscribe(fakeObserver);
        //     jest.runTimersToTime(100);
        //     expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        // });
        // it('.subscribe() returns the subscription', () => {
        //     const fakeObservable = Observable.interval(10).take(10);
        //     const subscription = fakeObservable.subscribe(fakeObserver);
        //     expect(subscription).toBeDefined();
        //     expect(subscription.unsubscribe).toBeDefined();
        //     expect(subscription.unsubscribe).toBeInstanceOf(Function);
        // });
    });
});
