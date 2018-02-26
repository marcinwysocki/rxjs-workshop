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

            return {
                unsubscribe() {
                    clearInterval(interval);
                },
            };
        });
    }

    // ex. 3
    map(projection) {
        return new Observable(observer => {
            const sub = this.subscribe({
                next(value) {
                    observer.next(projection(value));
                },
                complete() {
                    observer.complete();
                },
            });

            return {
                unsubscribe() {
                    sub.unsubscribe();
                },
            };
        });
    }

    // ex. 4
    take(count) {
        return new Observable(observer => {
            let counter = 0;

            const sub = this.subscribe({
                next(value) {
                    if (counter === count) {
                        sub.unsubscribe();
                        observer.complete();
                        return;
                    }

                    observer.next(value);
                    counter++;
                },
                complete() {
                    sub.unsubscribe();
                    observer.complete();
                },
            });

            return {
                unsubscribe() {
                    sub.unsubscribe();
                },
            };
        });
    }
}

module.exports = {
    Observable,
};
