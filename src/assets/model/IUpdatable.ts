export interface IUpdatable<T = any> {
    New(data?: IGridPutRequest<T>): void;
    Reset(data?: IGridPutRequest<T>): void;
    Put(data?: IGridPutRequest<T>): void;
    Delete(data?: IGridPutRequest<T>): void;
}

export interface IGridPutRequest<T = any> {
    data: T;
    rowIndex: number;
}