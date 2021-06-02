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
const assert = require("assert");
const __1 = require("..");
const unit_1 = require("../unit");
const mutex1 = new __1.default('redis-master', 6379);
const mutex2 = new __1.default('redis-master', 6379);
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
describe('base', function () {
    it('promise all', () => __awaiter(this, void 0, void 0, function* () {
        // this.timeout(10000);
        let number = 0;
        function unsafeAdd() {
            return __awaiter(this, void 0, void 0, function* () {
                let temp = number;
                yield unit_1.sleep(getRandomArbitrary(1, 100));
                number = temp + 1;
            });
        }
        function unsafeSubtract() {
            return __awaiter(this, void 0, void 0, function* () {
                let temp = number;
                yield unit_1.sleep(getRandomArbitrary(1, 100));
                number = temp - 1;
            });
        }
        const key = 'key';
        yield Promise.all(new Array(10)
            .fill(0)
            .map(() => __awaiter(this, void 0, void 0, function* () { return mutex1.lock(key, unsafeAdd); }))
            .concat(new Array(10).fill(0).map(() => __awaiter(this, void 0, void 0, function* () { return mutex2.lock(key, unsafeSubtract); }))));
        assert(number === 0, 'promise failed');
    }));
    it('promise && setTimeout', () => __awaiter(this, void 0, void 0, function* () {
        // this.timeout(10000);
        let number = 0;
        function unsafeAdd() {
            return __awaiter(this, void 0, void 0, function* () {
                let temp = number;
                yield unit_1.sleep(getRandomArbitrary(1, 100));
                number = temp + 1;
            });
        }
        function unsafeSubtract() {
            return __awaiter(this, void 0, void 0, function* () {
                let temp = number;
                yield unit_1.sleep(getRandomArbitrary(1, 100));
                number = temp - 1;
            });
        }
        const key = 'key';
        function func1(func) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mutex1.lock(key, func, true, 10);
            });
        }
        function func2(func) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield mutex2.lock(key, func, true, 100);
            });
        }
        let result = yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let result = [];
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield func1(unsafeAdd).then(() => result.push(3));
                yield func2(unsafeSubtract).then(() => result.push(4));
            }), 1000);
            yield func1(unsafeAdd).then(() => result.push(1));
            yield func2(unsafeSubtract).then(() => result.push(2));
            setInterval(() => {
                if (result.length === 4) {
                    resolve(result);
                }
            }, 1000);
        }));
        // console.log(number, result);
        assert(number === 0, `promise && setTimeout failed`);
    }));
    it('watchdog', function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.timeout(100000);
            function businessWaitingFun(fun, time = 1000) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield fun();
                    yield unit_1.sleep(time);
                    return true;
                });
            }
            let number = 0;
            function unsafeAdd() {
                return __awaiter(this, void 0, void 0, function* () {
                    let temp = number;
                    yield unit_1.sleep(getRandomArbitrary(1, 100));
                    number = temp + 1;
                });
            }
            function unsafeSubtract() {
                return __awaiter(this, void 0, void 0, function* () {
                    let temp = number;
                    yield unit_1.sleep(getRandomArbitrary(1, 100));
                    number = temp - 1;
                });
            }
            const key = 'key';
            function func1(func, time = 1000) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield mutex1.lock(key, () => __awaiter(this, void 0, void 0, function* () { return yield businessWaitingFun(func, time); }), true, 10);
                });
            }
            function func2(func, time = 1000) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield mutex2.lock(key, () => __awaiter(this, void 0, void 0, function* () { return yield businessWaitingFun(func, time); }), true, 10);
                });
            }
            let result = [];
            yield Promise.all([
                func1(unsafeAdd).then(() => result.push(1)),
                func1(unsafeSubtract).then(() => result.push(2)),
                func2(unsafeAdd).then(() => result.push(3)),
                func2(unsafeSubtract).then(() => result.push(4)),
            ]);
            // console.log(result);
            assert(number === 0, 'watchdog failed');
        });
    });
});
//# sourceMappingURL=index.js.map