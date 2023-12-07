export interface INavResponseBase {
    succeeded: boolean,
    message: string,
    errors: string[],
    data: unknown | null
}