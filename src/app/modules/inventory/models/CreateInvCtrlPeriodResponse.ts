import { InvCtrlPeriod } from "./InvCtrlPeriod";

export interface CreateInvCtrlPeriodResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data": InvCtrlPeriod;
}