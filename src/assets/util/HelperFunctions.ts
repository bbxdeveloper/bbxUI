import { CountryCode } from "src/app/modules/customer/models/CountryCode";
import { PaymentMethod } from "src/app/modules/invoice/models/PaymentMethod";
import { Origin } from "src/app/modules/origin/models/Origin";
import { ProductGroup } from "src/app/modules/product-group/models/ProductGroup";
import { UnitOfMeasure } from "src/app/modules/product/models/UnitOfMeasure";
import { VatRate } from "src/app/modules/vat-rate/models/VatRate";
import { WareHouse } from "src/app/modules/warehouse/models/WareHouse";
import { BlankComboBoxValue } from "../model/navigation/Nav";
import * as moment from 'moment';

const DATE_FORMATSTRING = 'YYYY-MM-DD';
const DATE_REGEX = /^([0-9]{4}-[0-9]{2}-[0-9]{2}){0,1}$/g;

export module HelperFunctions {
    export function ConvertChosenOriginToCode(comboVal?: string, data: Origin[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.originDescription === comboVal)[0].originCode ?? defaultValue;
        }
    }

    export function ConvertChosenProductGroupToCode(comboVal?: string, data: ProductGroup[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.productGroupDescription === comboVal)[0].productGroupCode ?? defaultValue;
        }
    }

    export function ConvertChosenVatRateToCode(comboVal?: string, data: VatRate[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.vatRateDescription === comboVal)[0].vatRateCode ?? defaultValue;
        }
    }

    export function ConvertChosenUOMToCode(comboVal?: string, data: UnitOfMeasure[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? 'PIECE';
        } else {
            return data.filter(x => x.text === comboVal)[0].value ?? '';
        }
    }

    export function ConvertChosenWareHouseToCode(comboVal?: string, data: WareHouse[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.warehouseDescription === comboVal)[0].warehouseCode ?? defaultValue;
        }
    }

    export function ConvertChosenCountryToCode(comboVal?: string, data: CountryCode[] = [],
        defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined ||
            comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.text === comboVal)[0].value ?? defaultValue;
        }
    }

    export function GetDescription(val?: string, defaultValue: any = ''): any {
        if (val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }
        if (val?.includes('-')) {
            return val.split('-')[1] ?? defaultValue;
        } else {
            return val;
        }
    }

    export function GetUOMDescription(val?: string, data?: UnitOfMeasure[], defaultValue: any = ''): any {
        if (data === undefined || data.length === 0 ||
            val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }
        return data.find(x => x.value === val)?.text ?? defaultValue;
    }

    export function PaymentMethodToDescription(val?: string, data?: PaymentMethod[],
        defaultValue: any = ''): any {
        if (val === undefined || val === null || val.length === 0 ||
            data === undefined || data.length === 0) {
            return defaultValue;
        } else {
            return data.find(x => x.text === val)?.value ?? defaultValue;
        }
    }

    export function GetOriginDescription(
        val?: string, data?: Origin[], defaultValue: any = ''): any {
        if (val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }
        if (val?.includes('-')) {
            return val.split('-')[1] ?? defaultValue;
        } else if (!!data && data.length > 0) {
            return data.find(x => x.originCode === val)?.originDescription ?? defaultValue;
        } else {
            return val;
        }
    }

    export function GetProductGroupDescription(
        val?: string, data?: ProductGroup[], defaultValue: any = ''): any {
        if (val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }
        if (val?.includes('-')) {
            return val.split('-')[1] ?? defaultValue;
        } else if (!!data && data.length > 0) {
            return data.find(x => x.productGroupCode === val)?.productGroupDescription ?? defaultValue;
        } else {
            return val;
        }
    }

    export function GetWarehouseDescription(
        val?: string, data?: WareHouse[], defaultValue: any = ''): any {
        if (val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }
        if (val?.includes('-')) {
            return val.split('-')[1] ?? defaultValue;
        } else if (!!data && data.length > 0) {
            return data.find(x => x.warehouseCode === val)?.warehouseDescription ?? defaultValue;
        } else {
            return val;
        }
    }

    export function FormFieldStringToDateTimeString(str: any): string {
        if (str === undefined || str.trim() === ""){
            return "";
        }
        return str.includes('T') ? new Date(str).toISOString() : new Date(str + 'T00:00:00').toISOString();
    }

    export function GenerateTodayFormFieldDateString(): string {
        const dateArray = new Date().toLocaleDateString('hu').split(". ");
        return dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2].substring(0, 2);
    }

    export function GetDateString(
        addDay: number = 0, addMonth: number = 0, addYear: number = 0,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): string {
        moment.locale(dateLocale);
        return moment(new Date())
            .add(addDay, "days")
            .add(addMonth, "months")
            .add(addYear, "years")
            .format(formatString);
    }

    export function GetDateStringFromDate(
        val: string,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): string {
        moment.locale(dateLocale);
        return moment(val)
            .format(formatString);
    }
    
    export function IsDateStringValid(
        val: string | undefined,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): boolean {
        if (val === undefined || val === null || val.length == 0) {
            return false;
        }
        moment.locale(dateLocale);
        console.log(`IsDateStringValid, val: ${val}, moment: ${moment(val)}, result: ${moment(val).isValid()}`);
        return moment(val)
            .isValid()
    }

    export function ToFloat(p: any): number {
        return p !== undefined || p === '' || p === ' ' ? parseFloat((p + '').replace(' ', '')) : 0;
    }

    export function ToInt(p: any): number {
        return p !== undefined || p === '' || p === ' ' ? parseInt((p + '').replace(' ', '')) : 0;
    }
}