"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const uuid_1 = require("uuid");
const unit_1 = require("./unit");
const uuid = () => uuid_1.v4().replace(/-/g, '').toUpperCase();
class Lock {
    constructor(host, port, client, prefix = 'redis_mutex_') {
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
    lock(key, fun, watchdog = true, expiresTime = 60 * 1000, retryTime = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pLock(key, () => __awaiter(this, void 0, void 0, function* () { return yield this.rLock(key, fun, watchdog, expiresTime, retryTime); }));
        });
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
    rLock(key, fun, watchdog = true, expiresTime = 60 * 1000, retryTime = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            key = key.startsWith(this._prefix) ? key : this._prefix + key;
            let result;
            let value = uuid(); //+ Math.random();
            let lock = false;
            let intervalId = undefined;
            try {
                lock = yield this.getLock({ key, value, expiresTime, retryTime });
                if (watchdog) {
                    intervalId = setInterval((key, value, expiresTime) => __awaiter(this, void 0, void 0, function* () {
                        yield this.pexpire(key, value, expiresTime);
                    }), unit_1.safeFloatPremiumCalc(expiresTime / 3));
                }
                result = yield fun();
            }
            finally {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                if (lock) {
                    yield this.releaseLock(key, value);
                }
            }
            return result;
        });
    }
    pLock(key, fun) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield unit_1.ProcessMutex.lock(key, fun);
        });
    }
    pexpire(key, value, expiresTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const luaScript = `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("pexpire",KEYS[1], ARGV[2]) else return 0 end`;
            return new Promise((resolve, reject) => {
                this._client.eval(luaScript, 1, key, value, expiresTime, (error, reply) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(reply === '1' ? true : false);
                });
            });
        });
    }
    getLock({ key, value, expiresTime = 600 * 1000, retryTime = 10, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                const client = this._client;
                function retryFun() {
                    const set = new Promise((resolve, reject) => {
                        client.set(key, value, 'NX', 'PX', expiresTime, (error, reply) => {
                            if (error) {
                                reject(error);
                            }
                            resolve(reply === 'OK' ? value : reply);
                        });
                    });
                    //  if (failAfterMillis != null) {
                    //      failTimeoutId = setTimeout(() => {
                    //          reject(new Error(`Lock could not be acquire for ${failAfterMillis} millis`));
                    //      }, failAfterMillis);
                    //  }
                    set.then((res) => {
                        if (res === value) {
                            resolve(value);
                        }
                        else {
                            setTimeout(retryFun, retryTime);
                        }
                    });
                }
                retryFun();
            });
            return key;
        });
    }
    releaseLock(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const luaScript = `if redis.call("get",KEYS[1]) == ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;
            return new Promise((resolve, reject) => {
                this._client.eval(luaScript, 1, key, value, (error, reply) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(reply === '1' ? true : false);
                });
            });
        });
    }
}
exports.default = Lock;
//# sourceMappingURL=index.js.map