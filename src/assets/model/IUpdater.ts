import { IGridPutRequest } from "./IUpdatable";

export interface IUpdater<T = any> {
    ActionNew(data?: IGridPutRequest<T>): void;
    ActionReset(data?: IGridPutRequest<T>): void;
    ActionPut(data?: IGridPutRequest<T>): void;
    ActionDelete(data?: IGridPutRequest<T>): void;
}