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

    describe('.of()', () => {
        it('returns an Observable', () => {
            expect(Observable.of(1, 2, 3)).toBeInstanceOf(Observable);
        });

        it("outputs all passed arguments one by on synchronously", () => {
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
});
