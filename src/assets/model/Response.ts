export interface Response<T> {
    pageNumber: number,
    pageSize: number,
    recordsFiltered: number,
    recordsTotal: number,
    succeeded: boolean,
    message?: any,
    errors?: any,
    data?: T[]
}