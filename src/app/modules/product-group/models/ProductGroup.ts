export interface ProductGroup {
    "id": number,
    "productGroupCode": string,
    "productGroupDescription": string,
    "createTime"?: string,
    "updateTime"?: string,
    "deleted"?: boolean,
    "minMargin"?: number
}

export function BlankProductGroup(): ProductGroup {
    return {
        id: 0,
        productGroupCode: '',
        productGroupDescription: '',
        createTime: '',
        updateTime: '',
        deleted: false,
        minMargin: 0
    } as ProductGroup;
}

export function ProductGroupDescriptionToCode(productGroupDescription: string, data: ProductGroup[]): string {
    return data.filter(x => x.productGroupDescription === productGroupDescription)[0].productGroupCode;
}

export function ProductGroupCodeToDescription(productGroupCode: string, data: ProductGroup[]): string {
    return data.filter(x => x.productGroupCode === productGroupCode)[0].productGroupDescription;
}