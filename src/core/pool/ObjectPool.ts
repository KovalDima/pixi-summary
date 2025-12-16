import { type IPoolable } from "./IPoolable";

export class ObjectPool<T extends IPoolable> {
    private readonly factory: () => T;
    private readonly pool: T[] = [];

    constructor(factory: () => T) {
        this.factory = factory;
    }

    public get(...args: any[]): T {
        let item: T;

        if (this.pool.length > 0) {
            item = this.pool.pop() as T;
        } else {
            item = this.factory();
        }

        item.reset(...args);
        return item;
    }

    public put(item: T) {
        if (item.clean) {
            item.clean();
        }
        this.pool.push(item);
    }
}