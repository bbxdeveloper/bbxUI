export interface DeleteProductGroupResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    /**
     * ID of deleted record.
     */
    "data"?: number
}