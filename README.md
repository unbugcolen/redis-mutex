# redis-mutex

mutex lock implemented using redis

## Install

```shell
npm install @unbugcolen/redis-mutex
```

## Use

```js
// js
const redisMutex = require('@unbugcolen/redis-mutex').default;
// ts
import redisMutex from '@unbugcolen/redis-mutex';

const mutex = new Lock('redis-master', 6379);
mutex.lock('mutex_key', async () => {
    // business code...
});
```

## Test

```sh
npm run test
```

## Dependence

redis

## Thanks

https://github.com/qw623577789/process-key-mutex
