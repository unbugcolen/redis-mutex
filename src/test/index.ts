import * as assert from 'assert';
import Lock from '..';
import { sleep } from '../unit';
const mutex1 = new Lock('redis-master', 6379);
const mutex2 = new Lock('redis-master', 6379);
function getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

describe('base', function () {
    it('promise all', async () => {
        // this.timeout(10000);
        let number = 0;
        async function unsafeAdd() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp + 1;
        }
        async function unsafeSubtract() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp - 1;
        }
        const key = 'key';
        await Promise.all(
            new Array(10)
                .fill(0)
                .map(async () => mutex1.lock(key, unsafeAdd))
                .concat(new Array(10).fill(0).map(async () => mutex2.lock(key, unsafeSubtract)))
        );

        assert(number === 0, 'promise failed');
    });

    it('promise && setTimeout', async () => {
        // this.timeout(10000);
        let number = 0;
        async function unsafeAdd() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp + 1;
        }
        async function unsafeSubtract() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp - 1;
        }
        const key = 'key';
        async function func1(func: () => void) {
            return await mutex1.lock(key, func, true, 10);
        }
        async function func2(func: () => void) {
            return await mutex2.lock(key, func, true, 100);
        }
        let result = await new Promise(async (resolve) => {
            let result: any = [];
            setTimeout(async () => {
                await func1(unsafeAdd).then(() => result.push(3));
                await func2(unsafeSubtract).then(() => result.push(4));
            }, 1000);
            await func1(unsafeAdd).then(() => result.push(1));
            await func2(unsafeSubtract).then(() => result.push(2));
            setInterval(() => {
                if (result.length === 4) {
                    resolve(result);
                }
            }, 1000);
        });
        console.log(number, result);
        assert(number === 0, `promise && setTimeout failed`);
    });

    it.only('watchdog', async function () {
        // this.timeout(100000000);
        async function businessWaitingFun(fun: () => void, time: number = 1000): Promise<boolean> {
            await fun();
            await sleep(time);
            return true;
        }

        let number = 0;
        async function unsafeAdd() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp + 1;
        }
        async function unsafeSubtract() {
            let temp = number;
            await sleep(getRandomArbitrary(1, 100));
            number = temp - 1;
        }
        const key = 'key';
        async function func1(func: () => void, time: number = 1000) {
            return await mutex1.lock(key, async () => await businessWaitingFun(func, time), true, 10);
        }
        async function func2(func: () => void, time: number = 1000) {
            return await mutex2.lock(key, async () => await businessWaitingFun(func, time), true, 10);
        }

        await Promise.all([
            func1(unsafeAdd).then(() => console.log('1')),
            func1(unsafeSubtract).then(() => console.log('2')),
            func2(unsafeAdd).then(() => console.log('3')),
            func2(unsafeSubtract).then(() => console.log('4')),
        ]);
        console.log(number);
        assert(number === 0, 'watchdog failed');
    });
});
