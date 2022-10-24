import { ModelFieldDescriptor } from "./ModelFieldDescriptor";
import { TileCssClass } from "./navigation/Navigatable";

export module CustomerDialogTableSettings {
    export const CustomerSelectorDialogAllColumns: string[] = [
        'customerName',
        'taxpayerNumber',
        'postalCode',
        'city',
        'thirdStateTaxId',
    ];
    export const CustomerSelectorDialogColDefs: ModelFieldDescriptor[] = [
        {
            label: 'Név',
            objectKey: 'customerName',
            colKey: 'customerName',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            fRequired: true,
            mask: '',
            colWidth: '400px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Belföldi Adószám',
            objectKey: 'taxpayerNumber',
            colKey: 'taxpayerNumber',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            mask: '0000000-0-00',
            colWidth: '200px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Irsz.',
            objectKey: 'postalCode',
            colKey: 'postalCode',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            mask: '',
            colWidth: '70px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Város',
            objectKey: 'city',
            colKey: 'city',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            fRequired: true,
            mask: '',
            colWidth: '200px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Külföldi Adószám',
            objectKey: 'thirdStateTaxId',
            colKey: 'thirdStateTaxId',
            defaultValue: '',
            type: 'string',
            fInputType: 'text',
            mask: '',
            colWidth: '135px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
    ];
}

export module ProductGroupDialogTableSettings {
    export const ProductGroupSelectorDialogAllColumns: string[] = [
        'productGroupCode',
        'productGroupDescription'
    ];
    export const ProductGroupSelectorDialogColDefs: ModelFieldDescriptor[] = [
        {
            label: 'Kód',
            objectKey: 'productGroupCode',
            colKey: 'productGroupCode',
            defaultValue: '',
            type: 'string',
            fInputType: 'code-field',
            fRequired: true,
            mask: '',
            colWidth: '100%',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Név',
            objectKey: 'productGroupDescription',
            colKey: 'productGroupDescription',
            defaultValue: '',
            type: 'string',
            fRequired: true,
            fInputType: 'text',
            mask: 'Set in sidebar form.',
            colWidth: '300px',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
            fLast: true
        },
    ];
}

export module ProductDialogTableSettings {
    export const ProductSelectorDialogAllColumns: string[] = [
        'productCode',
        'description',
        'unitPrice1',
        'unitPrice2',
    ];
    export const ProductSelectorDialogColDefs: ModelFieldDescriptor[] = [
        {
            label: 'Kód',
            objectKey: 'productCode',
            colKey: 'productCode',
            defaultValue: '',
            type: 'string',
            mask: '',
            colWidth: '26ch',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Megnevezés',
            objectKey: 'description',
            colKey: 'description',
            defaultValue: '',
            type: 'string',
            mask: '',
            colWidth: '70%',
            textAlign: 'left',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Elad ár 1',
            objectKey: 'unitPrice1',
            colKey: 'unitPrice1',
            defaultValue: '',
            type: 'formatted-number',
            fRequired: true,
            mask: '',
            colWidth: '130px',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Elad ár 2',
            objectKey: 'unitPrice2',
            colKey: 'unitPrice2',
            defaultValue: '',
            type: 'formatted-number',
            fRequired: false,
            mask: '',
            colWidth: '130px',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
    ];
}

export module InvoiceIncomeProductDialogTableSettings {
    export const ProductSelectorDialogAllColumns: string[] = [
        'productCode',
        'description',
        'unitPrice1',
        'unitPrice2',
        'latestSupplyPrice'
    ];
    export const ProductSelectorDialogColDefs: ModelFieldDescriptor[] = [
        {
            label: 'Kód',
            objectKey: 'productCode',
            colKey: 'productCode',
            defaultValue: '',
            type: 'string',
            mask: '',
            colWidth: '26ch',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Megnevezés',
            objectKey: 'description',
            colKey: 'description',
            defaultValue: '',
            type: 'string',
            mask: '',
            colWidth: '70%',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Elad ár 1',
            objectKey: 'unitPrice1',
            colKey: 'unitPrice1',
            defaultValue: '',
            type: 'formatted-number',
            fRequired: true,
            mask: '',
            colWidth: '130px',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Elad ár 2',
            objectKey: 'unitPrice2',
            colKey: 'unitPrice2',
            defaultValue: '',
            type: 'formatted-number',
            fRequired: false,
            mask: '',
            colWidth: '130px',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
        {
            label: 'Besz. Ár',
            objectKey: 'latestSupplyPrice',
            colKey: 'latestSupplyPrice',
            defaultValue: '',
            type: 'formatted-number',
            fRequired: false,
            mask: '',
            colWidth: '130px',
            textAlign: 'right',
            navMatrixCssClass: TileCssClass,
        },
    ];
}