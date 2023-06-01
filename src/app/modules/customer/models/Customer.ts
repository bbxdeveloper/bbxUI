import { UnitPriceTypes } from "./UnitPriceType";

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

    warningLimit?: number,
    maxLimit?: number,

    paymentDays: number,
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
        countryCode: 'Magyarország',
        comment: '',
        createTime: '',
        updateTime: '',
        deleted: false,
        isOwnData: false,
        taxpayerId: '',
        countyCode: '',
        email: '',
        unitPriceType: 'Listaár',
        paymentDays: 0,
        // warningLimit: 0,
        // maxLimit: 0
    } as Customer;
}