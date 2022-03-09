export interface DeleteWareHouseResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    /**
     * ID of deleted record.
     */
    "data"?: number
}