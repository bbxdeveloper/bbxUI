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
