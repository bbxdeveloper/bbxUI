import { IResponse } from "src/assets/model/IResponse";
import { InvPaymentItemFull } from "./InvPayment";

export interface GetInvPaymentsResponse extends IResponse<InvPaymentItemFull> {}