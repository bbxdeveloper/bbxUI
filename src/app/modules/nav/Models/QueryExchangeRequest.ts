import { IQueryParamList } from "src/assets/model/IQueryParamList";

export interface IQueryExchangeRequest extends IQueryParamList {
    createTimeFrom: string,
    createTimeTo: string,
    invoiceNumber: string,
    warningView: boolean,
    errorView: boolean,
}
