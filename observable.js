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
}

module.exports = {
    Observable,
};
