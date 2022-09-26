export interface IResponse<T> {
    pageNumber: number,
    pageSize: number,
    recordsFiltered: number,
    recordsTotal: number,
    succeeded: boolean,
    message?: any,
    errors?: any,
    data?: T[]
}

export interface IResponseSingleData<T> {
    succeeded: boolean,
    message?: any,
    errors?: any,
    data?: T
}