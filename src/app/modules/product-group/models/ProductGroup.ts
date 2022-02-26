export interface ProductGroup {
    "id": number,
    "productGroupCode": string,
    "productGroupDescription": string,
    "createTime"?: string,
    "updateTime"?: string,
    "deleted"?: boolean
}

export function BlankProductGroup(): ProductGroup {
    return {
        id: 0,
        productGroupCode: '',
        productGroupDescription: '',
        createTime: '',
        updateTime: '',
        deleted: false
    } as ProductGroup;
}