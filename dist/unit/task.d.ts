declare class Task {
    private _fun;
    private _resolve;
    private _reject;
    private _nextTask;
    private _afterFun;
    constructor(fun: () => Promise<any>, resolve: any, reject: any, afterFun: () => Promise<any>);
    do(): Promise<void>;
    set nextTask(nextTask: Task | null);
    get nextTask(): Task | null;
}
declare class ProcessKeyMutex {
    constructor();
    lock(key: any, task: any): Promise<unknown>;
}
