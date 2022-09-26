export interface DeleteInvCtrlPeriodResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    /**
     * ID of deleted record.
     */
    "data"?: number
}