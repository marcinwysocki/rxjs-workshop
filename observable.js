class Observable {
    constructor(subscribe) {
        this.subscribe = subscribe;
    }

    subscribe(observer) {
        return this.subscribe(observer);
    }

    // ex. 1
    static of(...args) {
        // your code...
    }

    // ex. 2
    static interval(period) {
        // your code...
    }
}

module.exports = {
    Observable,
};
