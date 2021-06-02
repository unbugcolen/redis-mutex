declare class ProcessMutex {
    constructor();
    lock(key: string, fun: () => any): Promise<unknown>;
}
declare const _default: ProcessMutex;
export default _default;
