export interface DeleteCounterResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    /**
     * ID of deleted record.
     */
    "data"?: number
}