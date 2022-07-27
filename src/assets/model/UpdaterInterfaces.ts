export interface IUpdatable<T = any> {
    Lock(data?: IUpdateRequest<T>): void;
    New(data?: IUpdateRequest<T>): void;
    Reset(data?: IUpdateRequest<T>): void;
    Put(data?: IUpdateRequest<T>): void;
    Delete(data?: IUpdateRequest<T>): void;
    Refresh(data?: IUpdateRequest<T>): void;
}

export interface IUpdater<T = any> {
    ActionLock(data?: IUpdateRequest<T>): void;
    ActionNew(data?: IUpdateRequest<T>): void;
    ActionReset(data?: IUpdateRequest<T>): void;
    ActionPut(data?: IUpdateRequest<T>): void;
    ActionDelete(data?: IUpdateRequest<T>): void;
    ActionRefresh(data?: IUpdateRequest<T>): void;
}

export interface IUpdateRequest<T = any> {
    data: T;
    rowIndex: number;
    needConfirmation?: boolean;
}