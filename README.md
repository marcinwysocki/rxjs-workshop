# Introduction to Observables and ReactiveX

## Run the tests

### Node.js 7+

After cloning the repo:

```
$ npm install
```

Now you can run the tests with:

```bash
$ npm test
````

If everything went well, you should see failing tests in your console.

You can run tests for a specific suite only:

```bash
$ npm test -- observable
```

To avoid retyping the above over and over you can run tests in watch mode:

```bash
$ npm run test:watch # runs all tests
$ npm run test:watch -- observable # runs only observable.spec.js
```

### Docker and `docker-compose`

Setup the container with `docker-compose`:

```bash
$ docker-compose up -d
```

Log into it:

```bash
$ docker-compose exec node sh
```

You should now be able to run all the node commands (see above) as if you had Node.js installed locally.

To put the container down run:

```bash
$ docker-compose down
```
