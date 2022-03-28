export interface WareHouse {
    "id": number,
    "warehouseCode": string,
    "warehouseDescription": string,
    "createTime"?: string,
    "updateTime"?: string,
    "deleted"?: boolean
}

export function BlankWareHouse(): WareHouse {
    return {
        id: 0,
        warehouseCode: '',
        warehouseDescription: '',
        createTime: '',
        updateTime: '',
        deleted: false
    } as WareHouse;
}

export function WareHouseDescriptionToCode(warehouseDescription: string, data: WareHouse[]): string {
    return data.filter(x => x.warehouseDescription === warehouseDescription)[0].warehouseCode ?? '';
}

export function WareHouseCodeToDescription(warehouseCode: string, data: WareHouse[]): string {
    return data.filter(x => x.warehouseCode === warehouseCode)[0].warehouseDescription ?? '';
}