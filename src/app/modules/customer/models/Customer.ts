import { OfflinePaymentMethods } from "../../invoice/models/PaymentMethod";
import { OfflineCountryCodes } from "./CountryCode";
import { OfflineUnitPriceTypes, UnitPriceTypes } from "./UnitPriceType";

export interface Customer {
    // available in GET
    id: number;
    /**
     * Not required!
     * 0000000-0-00
     */
    taxpayerNumber?: string;
    customerName: string;
    /**
     * xxxxxxxx-yyyyyyyy-zzzzzzzz or XX99 9999 9999 9999 9999 9999 9999
     */
    customerBankAccountNumber: string;
    customerVatStatus: string;
    privatePerson?: boolean,
    thirdStateTaxId: string;
    region: string;
    postalCode: string;
    city: string;
    additionalAddressDetail: string;
    isOwnData: boolean;
    countryCode: string,
    countryCodeX: string,
    Region?: any,
    taxpayerId: string;
    countyCode: string;
    // misc
    comment: string;
    createTime: string;
    updateTime: string;
    deleted?: boolean;

    email: string;
    Email: string;
    unitPriceType: UnitPriceTypes|string
    unitPriceTypeX: string,

    defPaymentMethod: string,
    defPaymentMethodX: string,

    vatCode?: string,

    warningLimit?: number,
    maxLimit?: number,

    paymentDays: number,

    latestDiscountPercent?: number,

    isFA: boolean
}

export function isCustomerPrivatePerson(customer: Customer): boolean {
    return customer.customerVatStatus === 'PRIVATE_PERSON'
}

export function BlankCustomer(): Customer {
    return {
        id: 0,
        taxpayerNumber: '',
        customerName: '',
        customerBankAccountNumber: '',
        customerVatStatus: '',
        privatePerson: false,
        thirdStateTaxId: '',
        region: '',
        postalCode: '',
        city: '',
        additionalAddressDetail: '',
        countryCode: OfflineCountryCodes.Hu.text,
        comment: '',
        createTime: '',
        updateTime: '',
        deleted: false,
        isOwnData: false,
        taxpayerId: '',
        countyCode: '',
        email: '',
        unitPriceType: OfflineUnitPriceTypes.Unit.text,
        paymentDays: 8,
        warningLimit: undefined,
        maxLimit: undefined,
        defPaymentMethod: OfflinePaymentMethods.Cash.text,
        latestDiscountPercent: undefined,
        isFA: false,
    } as Customer;
}