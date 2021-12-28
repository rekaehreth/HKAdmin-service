
## Description

## Installation

```bash
$ npm install
```

## Starting the app

```bash
# start the application in docker
$ docker-compose up -d --build
```

## Test

```bash
# start test db
$ docker-compose -f docker-compose-test.yml up -d 

# unit tests
$ npm run test:local
```
