import { CountryCode } from "src/app/modules/customer/models/CountryCode";
import { PaymentMethod } from "src/app/modules/invoice/models/PaymentMethod";
import { Origin } from "src/app/modules/origin/models/Origin";
import { ProductGroup } from "src/app/modules/product-group/models/ProductGroup";
import { UnitOfMeasure } from "src/app/modules/product/models/UnitOfMeasure";
import { VatRate } from "src/app/modules/vat-rate/models/VatRate";
import { WareHouse } from "src/app/modules/warehouse/models/WareHouse";
import { BlankComboBoxValue } from "../model/navigation/Nav";
import * as moment from 'moment';
import { ConfirmationDialogComponent } from "src/app/modules/shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component";
import { CalculatorPopoverComponent } from "src/app/modules/shared/calculator-popover/calculator-popover.component";
import { FormGroup } from "@angular/forms";
import { OneButtonConfirmationDialogComponent } from "src/app/modules/shared/simple-dialogs/one-button-confirmation-dialog/one-button-confirmation-dialog.component";
import { NavigatableType } from "../model/navigation/Navigatable";
import { OneNumberInputDialogComponent } from "src/app/modules/shared/simple-dialogs/one-number-input-dialog/one-number-input-dialog.component";
import { createMask } from "@ngneat/input-mask";
import { CurrencyCodes } from "src/app/modules/system/models/CurrencyCode";
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

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
        val?: string,
        data?: ProductGroup[],
        defaultValue: any = ''): any {
        if (val === undefined || val === null || val.trim() === '') {
            return defaultValue;
        }

        if (!!data && data.length > 0) {
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

    export function AddToDate(date: string, addDay: number = 0, addMonth: number = 0, addYear: number = 0,
        formatString: string = DATE_FORMATSTRING, dateLocale: string = 'hu-HU'): string {
        moment.locale(dateLocale)
        return moment(date)
            .add(addDay, "days")
            .add(addMonth, "months")
            .add(addYear, "years")
            .format(formatString)
    }

    export function GetOnlyDateFromUtcDateString(val: string): string {
        if (val === undefined || val === null || val.length == 0 || val.indexOf("T") === -1) {
            return "";
        } else {
            return val.split("T")[0];
        }
    }

    export function GetDateStringFromDate(
        val: string,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): string {
        if (!IsDateStringValid(val)) {
            return "";
        }
        moment.locale(dateLocale);
        return moment(val)
            .format(formatString);
    }

    export function IsDateStringValid(
        val: string | undefined,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): boolean {
        // console.log(`IsDateStringValid, val: ${val}, moment: ${moment(val)}, result: ${moment(val).isValid()}`);
        if (val === undefined || val === null || val.length == 0) {
            return false;
        }
        moment.locale(dateLocale);
        return moment(val)
            .isValid()
    }

    export function GetDateIfDateStringValid(
        val: string | undefined,
        formatString: string = DATE_FORMATSTRING,
        dateLocale: string = 'hu-HU'): moment.Moment | undefined  {
        // console.log(`IsDateStringValid, val: ${val}, moment: ${moment(val)}, result: ${moment(val).isValid()}`);
        if (val === undefined || val === null || val.length == 0) {
            return undefined;
        }
        moment.locale(dateLocale);
        return moment(val)
            .isValid() ? moment(val) : undefined
    }

    export function ToFloat(p: any): number {
        return (p !== null && p !== undefined) || p === '' || p === ' ' ? parseFloat((p + '').replace(/\s/g, '')) : 0;
    }

    export function ToInt(p: any): number {
        return (p !== null && p !== undefined) || p === '' || p === ' ' ? parseInt((p + '').replace(/\s/g, '')) : 0;
    }

    export function ToOptionalInt(p: any): number | undefined {
        return isEmptyOrSpaces(p) ? undefined : parseInt((p + '').replace(/\s/g, ''));
    }

    export function currencyRound(value: number, currency: CurrencyCodes|string|undefined|null, roundToFillér = false): number {
        if (currency === CurrencyCodes.HUF) {
            return roundToFillér
                ? Round2(value, 1)
                : Round(value)
        }
        else {
            return Round2(value, 2)
        }
    }

    export function Round(value: string | number): number {
        return Math.round(ToFloat(value));
    }

    export function IsStringValid(str: any): boolean {
        if (str !== undefined && str !== null && (str + '').length > 0) {
            return true;
        }
        return false;
    }

    export function IsNumber(val: string): boolean {
        let val2 = val.replace(/\s/g, '');
        return !isNaN(parseFloat(val2));
    }

    export function confirm(dialogService: BbxDialogServiceService, msg: string, yesFunction: any, noFunction: any = () => {}): void {
        const confirmDialogRef = dialogService.open(ConfirmationDialogComponent, { context: { msg: msg } });
        confirmDialogRef.onClose.subscribe(res => {
            if (res) {
                yesFunction();
            } else {
                noFunction();
            }
        });
    }

    export function confirmAsync(dialogService: BbxDialogServiceService, msg: string, yesFunctionAsync: any, noFunctionAsync: any = () => { }): void {
        const confirmDialogRef = dialogService.open(ConfirmationDialogComponent, { context: { msg: msg } });
        confirmDialogRef.onClose.subscribe(async res => {
            if (res) {
                await yesFunctionAsync();
            } else {
                await noFunctionAsync();
            }
        });
    }

    export function confirmOneButtonAsync(dialogService: BbxDialogServiceService, msg: string, buttonText: string, yesFunctionAsync: any): void {
        const confirmDialogRef = dialogService.open(OneButtonConfirmationDialogComponent, { context: { msg: msg, buttonText: buttonText } });
        confirmDialogRef.onClose.subscribe(async res => {
            await yesFunctionAsync();
        });
    }

    export function openCalculator(dialogService: BbxDialogServiceService, startValue: number, handle: (result?: number) => Promise<void>): void {
        const calculatorDialogRef = dialogService.open(CalculatorPopoverComponent, { context: { result: startValue } });
        calculatorDialogRef.onClose.subscribe(handle);
    }

    export function Round2(value: number, fractionDigits: number): number {
        return HelperFunctions.ToFloat(HelperFunctions.ToFloat(value).toFixed(fractionDigits));
    }

    export function Round2Old(n: number, r: number): number {
        let int = Math.floor(n).toString()
        if (typeof n !== 'number' || typeof r !== 'number') {
            return n;
        }
        if (int[0] == '-' || int[0] == '+') {
            int = int.slice(1, int.length)
        }
        return HelperFunctions.ToFloat(n.toPrecision(int.length + r));
    }

    export function StringFormat(template: any, ...params: any[]): string {
        return (template + "").replace(/{(\d+)}/g, function(match, index) {
            return params.length > index ? params[index] + "" : "<< missing parameter >>";
        });
    }

    export function StopEvent(event: any): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
    }

    export function CashRound(val: number): number {
        val = ToFloat(val);
        if (val === 0) {
            return 0;
        }
        return Math.round(val / 5) * 5;
    }

    export function CASHRound(p_num: number): number {
        if (p_num === 0) {
            return 0;
        }

        const negative = p_num < 0;
        p_num = negative ? (p_num * -1.0) : p_num;

        p_num = Round(p_num);

        const lastDigit = (p_num % 10);
        let roundNum = 5;
        if (lastDigit >= 8) {
            roundNum = 10;
        }
        else if (lastDigit <= 2) {
            roundNum = 10;
        }
        else {
            roundNum = 5;
        }

        let res = 0;
        if (p_num > 0) {
            res = p_num - lastDigit + roundNum;
        }
        else {
            res = p_num + lastDigit - roundNum;
        }

        return negative ? (res * -1.0) : res;
    }

    export function isEmptyOrSpaces(str: any): boolean {
        return str === null || str === undefined || (str + '').match(/^ *$/) !== null;
    }

    export function SelectBeginningById(inputId: string, defaultSelectionEnd: number = 1): void {
        const _input = document.getElementById(inputId) as HTMLInputElement;
        if (!!_input && _input.type === "text") {
            window.setTimeout(function () {
                const txtVal = $(_input).val() + '';
                console.log('txtVal: ', txtVal);
                if (!!txtVal) {
                    const l = txtVal.split('.')[0].length;
                    _input.setSelectionRange(0, l);
                } else {
                    _input.setSelectionRange(0, defaultSelectionEnd);
                }
            }, 0);
        }
    }

    export function SelectBeginningByClass(className: string, defaultSelectionEnd: number = 0, cursorAfterLastChar: boolean = false, value?: string): void {
        const _input = document.getElementsByClassName(className)[0] as HTMLInputElement;
        if(!!_input && _input.type === "text") {
            window.setTimeout(function () {
                const txtVal = value ?? $('.' + className)[0].innerText;
                if (!!txtVal) {
                    if (cursorAfterLastChar) {
                        const count = txtVal.length;
                        _input.setSelectionRange(count, count);
                    } else {
                        const l = txtVal.split('.')[0].length;
                        _input.setSelectionRange(0, l);
                    }
                } else {
                    _input.setSelectionRange(0, defaultSelectionEnd);
                }
            }, 0);
        }
    }

    export function ParseObjectAsQueryString<T>(params: T): string {
        if (!params) {
            return '';
        }

        var queryParams = '';
        var index = 0;

        Object.keys(params).forEach((key: string) => {
            const paramsField = params[key as keyof T]
            if (paramsField != undefined && paramsField != null && !HelperFunctions.isEmptyOrSpaces(paramsField)) {
                if (Array.isArray(paramsField) && paramsField.length > 0) {
                    for (let i = 0; i < paramsField.length; i++) {
                        if (index == 0) {
                            queryParams += key + '=' + paramsField[i];
                        } else {
                            queryParams += '&' + key + '=' + paramsField[i];
                        }
                        index++;
                    }
                } else {
                    if (index == 0) {
                        queryParams += key + '=' + paramsField;
                    } else {
                        queryParams += '&' + key + '=' + paramsField;
                    }
                    index++;
                }
            }
        });

        return queryParams;
    }

    export function FillForm(form: FormGroup, data: any, skip: string[] = [], mapping: { from: string, to: string }[] = []) {
        if (!!data) {
            Object.keys(form.controls).forEach((x: string) => {
                if (!skip.includes(x)) {
                    form.controls[x].setValue(data[x]);
                }
            });
            mapping.forEach(x => {
                form.controls[x.to].setValue(data[x.from]);
            })
        }
    }

    /**
     * Updates fields in destination object by corresponding fields from source object.
     * Types of fields are not checkec during the process!
     * @param source 
     * @param destination 
     * @param skip 
     * @param mapping 
     */
    export function PatchObject(source: any, destination: any, skip: string[] = [], mapping: { from: string, to: string }[] = []): any {
        if (source && destination) {
            const srcKeys = Object.keys(source)
            mapping.forEach(m => {
                skip.push(m.to)
                destination[m.to] = source[m.from]
            })
            Object.keys(destination).forEach((x: string) => {
                if (!skip.includes(x) && srcKeys.includes(x)) {
                    destination[x] = source[x]
                }
            })
        }
        return destination
    }

    export function GetFieldValueFromGeneric(data: any, objectKey: string = 'id', defaultValue?: any): any {
        const keys = Object.keys(data)
        const idKey = keys.find(x => x.toLowerCase() === objectKey)!
        if (idKey === undefined) {
            return defaultValue
        }
        return data[idKey]
    }

    export function IsEmptyEditableTable(focusedTable?: any): boolean {
        if (!focusedTable) {
            return false
        }
        const hasData = Object.keys(focusedTable).includes('data')
        return focusedTable.NavigatableType === NavigatableType.inline_editable_table && hasData && focusedTable.data.length === 1
    }

    export function TestOneNumberInputDialog(dialogService: BbxDialogServiceService): void {
        var dialogRef;
        try {
        dialogRef = dialogService.open(OneNumberInputDialogComponent, {
            context: {
            title: 'Input Test',
            inputLabel: 'Label',
            defaultValue: 1,
            numberInputMask: createMask({
                alias: 'numeric',
                groupSeparator: ' ',
                digits: 0,
                digitsOptional: false,
                prefix: '',
                placeholder: '',
                min: 1,
                max: 99
            }),
            minValue: 1,
            maxValue: 99,
            limitValue: true,
            placeHolder: ''
            }
        });
        } catch (error) {}
    }
}