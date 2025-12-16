export interface IPoolable {
    reset(...args: any[]): void;
    clean?(): void;
}