import { InvCtrlPeriod } from "./InvCtrlPeriod";

export interface UpdateInvCtrlPeriodResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: InvCtrlPeriod;
}