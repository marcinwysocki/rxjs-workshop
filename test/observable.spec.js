const { Observable } = require('../observable');

describe('Observable', () => {
    const fakeObserver = {
        next: jest.fn(),
        complete: jest.fn(),
    };

    beforeEach(() => {
        Object.keys(fakeObserver).forEach(key => {
            fakeObserver[key].mockClear();
        });
    });

    describe('instance', () => {
        it("doesn't do any work at initialization", () => {
            const spy = jest.fn();
            const fakeObservable = new Observable(observer => {
                spy();
                observer.complete();
            });

            expect(spy).not.toHaveBeenCalled();
        });

        it('does the actual work after subscribing to it', () => {
            const spy = jest.fn();
            const fakeObservable = new Observable(observer => {
                spy();
                observer.complete();
            });

            expect(spy).not.toHaveBeenCalled();

            fakeObservable.subscribe(fakeObserver);

            expect(spy).toHaveBeenCalled();
            expect(fakeObserver.complete).toHaveBeenCalled();
        });
    });

    describe('.of()', () => {
        it('returns an Observable', () => {
            expect(Observable.of(1, 2, 3)).toBeInstanceOf(Observable);
        });

        it('outputs all passed arguments one by on synchronously', () => {
            const fakeObservable = Observable.of(1, 2, 3);

            fakeObservable.subscribe(fakeObserver);

            expect(fakeObserver.next).toHaveBeenCalledTimes(3);

            const [first, second, third] = fakeObserver.next.mock.calls;

            expect(first[0]).toBe(1);
            expect(second[0]).toBe(2);
            expect(third[0]).toBe(3);
        });

        it('completes after passing all the values', () => {
            const fakeObservable = Observable.of(1, 2, 3);

            fakeObservable.subscribe(fakeObserver);

            expect(fakeObserver.next).toHaveBeenCalledTimes(3);
            expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        });

        it('completes immediately if no arguments have been passed', () => {
            const fakeObservable = Observable.of();

            fakeObservable.subscribe(fakeObserver);

            expect(fakeObserver.next).not.toHaveBeenCalled();
            expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        });

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = Observable.of(1, 2, 3);

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });

    describe('interval()', () => {
        beforeEach(() => {
            jest.clearAllTimers();
            jest.useFakeTimers();
        });

        it('returns an Observable', () => {
            expect(Observable.interval(200)).toBeInstanceOf(Observable);
        });

        it('emits values with specified interval', () => {
            const fakeObservable = Observable.interval(50);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime(200);

            expect(fakeObserver.next).toHaveBeenCalledTimes(4);
        });

        it('starts emitting the values after specified interval', () => {
            const fakeObservable = Observable.interval(50);

            fakeObservable.subscribe(fakeObserver);

            jest.runTimersToTime(25);
            expect(fakeObserver.next).not.toHaveBeenCalled();
            jest.runTimersToTime(25);
            expect(fakeObserver.next).toHaveBeenCalledTimes(1);
            jest.runTimersToTime(50);
            expect(fakeObserver.next).toHaveBeenCalledTimes(2);
        });

        it('emits incrementing numbers, starting with 0', () => {
            const fakeObservable = Observable.interval(50);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime(200);

            expect(fakeObserver.next.mock.calls.length).toBe(4);
            expect(fakeObserver.next.mock.calls[0][0]).toBe(0);
            expect(fakeObserver.next.mock.calls[1][0]).toBe(1);
            expect(fakeObserver.next.mock.calls[2][0]).toBe(2);
            expect(fakeObserver.next.mock.calls[3][0]).toBe(3);
        });

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = Observable.interval(10);

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });
});
