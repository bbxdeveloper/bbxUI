export interface UnitPriceType {
    value: UnitPriceTypes,
    text: string,
    icon: string|null,
    data: string|null
}

export enum UnitPriceTypes {
    List = 'LIST',
    Unit = 'UNIT'
}

export const OfflineUnitPriceTypes = {
    List: {
        "value": "LIST",
        "text": "Listaár",
        "icon": null,
        "data": null
    },
    Unit: {
        "value": "UNIT",
        "text": "Egységár",
        "icon": null,
        "data": null
    }
}