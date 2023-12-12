export interface INavResponseBase<T = unknown | null> {
    succeeded: boolean,
    message: string,
    errors: string[],
    data: T
}