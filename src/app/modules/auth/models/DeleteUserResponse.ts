export interface DeleteUserResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    /**
     * ID of deleted record.
     */
    "data"?: number
}