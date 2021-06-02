import * as redis from 'redis';
declare class Lock {
    private _client;
    private _prefix;
    constructor(host?: string, port?: number, client?: redis.RedisClient, prefix?: string);
    /**
     *
     * @param key
     * @param fun
     * @param watchdog
     * @param expiresTime 60000ms
     * @param retryTime 10ms
     * @returns
     */
    lock(key: string, fun: (...args: any) => Promise<any>, watchdog?: boolean, expiresTime?: number, retryTime?: number): Promise<unknown>;
    /**
     *
     * @param key
     * @param fun
     * @param watchdog
     * @param expiresTime 60000ms
     * @param retryTime 10ms
     * @returns
     */
    private rLock;
    private pLock;
    pexpire(key: string, value: string, expiresTime: number): Promise<unknown>;
    private getLock;
    private releaseLock;
}
export default Lock;
