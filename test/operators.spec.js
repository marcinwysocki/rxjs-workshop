const { Observable } = require('../observable');

describe('operators', () => {
    const fakeObserver = {
        next: jest.fn(),
        complete: jest.fn(),
        error: jest.fn(),
    };

    beforeEach(() => {
        Object.keys(fakeObserver).forEach(key => {
            fakeObserver[key].mockClear();
        });
    });

    describe('.map()', () => {
        it('returns an Observable', () => {
            expect(Observable.of(1, 2, 3).map(x => x)).toBeInstanceOf(
                Observable,
            );
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

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = Observable.of(1, 2, 3).map(v => v);

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });

    describe('take()', () => {
        beforeEach(() => {
            jest.clearAllTimers();
            jest.useFakeTimers();
        });

        it('returns an Observable', () => {
            const fakeObservable = Observable.interval(200);

            expect(fakeObservable.take(3)).toBeInstanceOf(Observable);
        });

        it('passes through values unchanged', () => {
            const fakeObservable = Observable.interval(10).take(3);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime(100);

            expect(fakeObserver.next.mock.calls[0][0]).toBe(0);
            expect(fakeObserver.next.mock.calls[1][0]).toBe(1);
            expect(fakeObserver.next.mock.calls[2][0]).toBe(2);
        });

        it('emits only specified amount of values emited first by the parent Observable', () => {
            const fakeObservable = Observable.interval(10).take(3);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime(100);

            expect(fakeObserver.next).toHaveBeenCalledTimes(3);
        });

        it('completes immediately if 0 is passed', () => {
            const fakeObservable = Observable.interval(10).take(0);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime();

            expect(fakeObserver.next).toHaveBeenCalledTimes(0);
            expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        });

        it('completes after emiting specified amount of values', () => {
            const fakeObservable = Observable.interval(10).take(3);

            fakeObservable.subscribe(fakeObserver);
            jest.runTimersToTime(100);

            expect(fakeObserver.complete).toHaveBeenCalledTimes(1);
        });

        it('.subscribe() returns the subscription', () => {
            const fakeObservable = Observable.interval(10).take(10);

            const subscription = fakeObservable.subscribe(fakeObserver);

            expect(subscription).toBeDefined();
            expect(subscription.unsubscribe).toBeDefined();
            expect(subscription.unsubscribe).toBeInstanceOf(Function);
        });
    });
});
