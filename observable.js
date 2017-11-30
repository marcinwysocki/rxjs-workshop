class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }

    subscribe(observer) {
        return this._subscribe(observer);
    }

    // ex. 1
    static of(...args) {
        return new Observable(observer => {
            args.forEach(value => {
                observer.next(value);
            });

            observer.complete();

            return {
                unsubscribe() {},
            };
        });
    }

    // ex. 2
    static interval(period) {
        return new Observable(observer => {
            let counter = 0;
            const interval = setInterval(() => {
                observer.next(counter);
                counter++;
            }, period);
<<<<<<< 836bfe0a84ce884fa0e81691ea912bf3e2725c3d

            return {
                unsubscribe() {
                    clearInterval(interval);
=======

            return {
                unsubscribe() {
                    clearInterval(interval);
                },
            };
        });
    }

    // ex. 3
    take(count) {
        return new Observable(observer => {
            let counter = 0;

            const parentSubscription = this.subscribe({
                next(value) {
                    if (counter < count) {
                        observer.next(value);
                        counter++;
                    } else {
                        parentSubscription.unsubscribe();
                        observer.complete();
                    }
                },
                complete() {
                    parentSubscription.unsubscribe();
                    observer.complete();
                },
            });

            return {
                unsubscribe() {
                    parentSubscription.unsubscribe();
>>>>>>> stage1 solution
                },
            };
        });
    }
}

module.exports = {
    Observable,
};
