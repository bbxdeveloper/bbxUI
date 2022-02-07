export interface IUpdatable<T = any> {
    Put(data?: IGridPutRequest<T>): void;
}

export interface IGridPutRequest<T = any> {
    data: T;
    rowIndex: number;
}