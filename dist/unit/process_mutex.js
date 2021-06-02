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
class Task {
    constructor(fun, resolve, reject, afterFun) {
        this._fun = fun;
        this._resolve = resolve;
        this._reject = reject;
        this._nextTask = null;
        this._afterFun = afterFun;
    }
    do() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this._resolve(yield this._fun());
            }
            catch (error) {
                this._reject(error);
            }
            finally {
                if (this._nextTask != null) {
                    this._nextTask.do();
                }
                else {
                    this._afterFun();
                }
            }
        });
    }
    set nextTask(nextTask) {
        this._nextTask = nextTask;
    }
    get nextTask() {
        return this._nextTask;
    }
}
class ProcessMutex {
    constructor() {
        if (globalThis._processMutex === undefined) {
            globalThis._processMutex = new Map();
        }
    }
    lock(key, fun) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                let newTask = new Task(fun, resolve, reject, () => _processMutex.delete(key));
                if (_processMutex.has(key)) {
                    let _ = _processMutex.get(key);
                    _.nextTask = newTask;
                    _processMutex.set(key, newTask);
                }
                else {
                    _processMutex.set(key, newTask);
                    newTask.do();
                }
            });
        });
    }
}
exports.default = new ProcessMutex();
//# sourceMappingURL=process_mutex.js.map