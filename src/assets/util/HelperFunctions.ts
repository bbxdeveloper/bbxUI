import { CountryCode } from "src/app/modules/customer/models/CountryCode";
import { Origin } from "src/app/modules/origin/models/Origin";
import { ProductGroup } from "src/app/modules/product-group/models/ProductGroup";
import { UnitOfMeasure } from "src/app/modules/product/models/UnitOfMeasure";
import { VatRate } from "src/app/modules/vat-rate/models/VatRate";
import { WareHouse } from "src/app/modules/warehouse/models/WareHouse";
import { BlankComboBoxValue } from "../model/navigation/Nav";

export module HelperFunctions {
    export function ConvertChosenOriginToCode(comboVal?: string, data: Origin[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.originDescription === comboVal)[0].originCode ?? defaultValue;
        }
    }

    export function ConvertChosenProductGroupToCode(comboVal?: string, data: ProductGroup[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.productGroupDescription === comboVal)[0].productGroupCode ?? defaultValue;
        }
    }

    export function ConvertChosenVatRateToCode(comboVal?: string, data: VatRate[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => (x.vatPercentage + defaultValue) === comboVal)[0].vatRateCode ?? defaultValue;
        }
    }

    export function ConvertChosenUOMToCode(comboVal?: string, data: UnitOfMeasure[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? 'PIECE';
        } else {
            return data.filter(x => x.text === comboVal)[0].value ?? '';
        }
    }

    export function ConvertChosenWareHouseToCode(comboVal?: string, data: WareHouse[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
            return defaultValue;
        }
        if (comboVal?.includes('-')) {
            return comboVal.split('-')[0] ?? defaultValue;
        } else {
            return data.filter(x => x.warehouseDescription === comboVal)[0].warehouseCode ?? defaultValue;
        }
    }

    export function ConvertChosenCountryToCode(comboVal?: string, data: CountryCode[] = [], defaultValue: any = ''): any {
        if (comboVal === BlankComboBoxValue || comboVal === undefined || comboVal === null || comboVal === defaultValue) {
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
}