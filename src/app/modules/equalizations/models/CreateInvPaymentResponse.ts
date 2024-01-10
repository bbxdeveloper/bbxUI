import { InvPayment } from "./InvPayment";

export interface CreateInvPaymentResponse {
    "succeeded": boolean,
    "message"?: string,
    "errors"?: string[],
    "data"?: InvPayment
}