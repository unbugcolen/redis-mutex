import * as redis from 'redis';
import { v4 } from 'uuid';
import { safeFloatPremiumCalc as safeFloatCalc, sleep } from './unit';
const uuid = () => v4().replace(/-/g, '').toUpperCase();

class Lock {
    private _client: redis.RedisClient;
    private _prefix: string;
    constructor(host?: string, port?: number, client?: redis.RedisClient, prefix = 'redis_mutex_') {
        this._client = client ? client : redis.createClient({ host, port });
        this._prefix = prefix;
    }
    /**
     *
     * @param key
     * @param fun
     * @param watchdog
     * @param expiresTime 60000ms
     * @param retryTime 10ms
     * @returns
     */
    async lock(
        key: string,
        fun: (...args: any) => void,
        watchdog: boolean = true,
        expiresTime: number = 60 * 1000,
        retryTime: number = 10
    ): Promise<any> {
        key = key.startsWith(this._prefix) ? key : this._prefix + key;
        let result;
        let value = uuid(); //+ Math.random();
        let lock: any = false;
        let intervalId: any = undefined;
        try {
            lock = await this.getLock({ key, value, expiresTime });
            if (lock) {
                if (watchdog) {
                    intervalId = setInterval((key, value, expiresTime) => {
                        this.pexpire(key, value, expiresTime);
                    }, safeFloatCalc(expiresTime / 3));
                }

                result = await fun();
            } else {
                await sleep(retryTime);
                result = await this.lock(key, fun, watchdog, expiresTime, retryTime);
            }
        } finally {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (lock) {
                await this.releaseLock(key, value);
            }
        }
        return result;
    }

    async pexpire(key: string, value: string, expiresTime: number) {
        const luaScript = `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("pexpire",KEYS[1], ARGV[2]) else return 0 end`;
        return new Promise((resolve, reject) => {
            this._client.eval(luaScript, 1, key, value, expiresTime, (error, reply) => {
                if (error) {
                    reject(error);
                }
                resolve(reply === '1' ? true : false);
            });
        });
    }

    private async getLock({
        key,
        value,
        expiresTime = 600 * 1000,
    }: {
        key: string;
        value: string;
        expiresTime?: number;
    }) {
        return new Promise((resolve, reject) => {
            this._client.set(key, value, 'NX', 'PX', expiresTime, (error, reply) => {
                if (error) {
                    reject(error);
                }
                resolve(reply === 'OK' ? value : reply);
            });
        });
    }

    private async releaseLock(key: string, value: string): Promise<boolean> {
        const luaScript = `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;
        return new Promise((resolve, reject) => {
            this._client.eval(luaScript, 1, key, value, (error, reply) => {
                if (error) {
                    reject(error);
                }
                resolve(reply === '1' ? true : false);
            });
        });
    }
}

export default Lock;
