import { JsonIgnore } from "src/assets/model/navigation/DynamicObject";
import { InvoiceLine } from "../models/InvoiceLine";
import { CurrencyCodes } from "../../system/models/CurrencyCode";

export class InvoiceLineWithCurrency extends InvoiceLine {
    @JsonIgnore
    currency = CurrencyCodes.HUF
}
