import { User } from "./User";

export interface GetUsersResponse {
    "pageNumber": number,
    "pageSize": number,
    "recordsFiltered": number,
    "recordsTotal": number,
    "succeeded": boolean,
    /** string */
    "message": any,
    /** string[] ? */
    "errors"?: string[],
    "data": User[]
}