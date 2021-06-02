class Task {
    private _fun: () => Promise<any>;
    private _resolve: any;
    private _reject: any;
    private _nextTask: null | Task;
    private _afterFun: () => Promise<any>;
    constructor(fun: () => Promise<any>, resolve: any, reject: any, afterFun: () => any) {
        this._fun = fun;
        this._resolve = resolve;
        this._reject = reject;
        this._nextTask = null;
        this._afterFun = afterFun;
    }

    async do() {
        try {
            this._resolve(await this._fun());
        } catch (error) {
            this._reject(error);
        } finally {
            if (this._nextTask != null) {
                this._nextTask.do();
            } else {
                this._afterFun();
            }
        }
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

    async lock(key: string, fun: () => any) {
        return await new Promise((resolve, reject) => {
            let newTask = new Task(fun, resolve, reject, () => _processMutex.delete(key));
            if (_processMutex.has(key)) {
                let _ = _processMutex.get(key);
                _.nextTask = newTask;
                _processMutex.set(key, newTask);
            } else {
                _processMutex.set(key, newTask);
                newTask.do();
            }
        });
    }
}

export default new ProcessMutex();
