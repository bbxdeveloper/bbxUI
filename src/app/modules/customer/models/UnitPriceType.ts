export interface UnitPriceType {
    value: string,
    text: string,
    icon: string|null,
    data: string|null
}

export enum UnitPriceTypes {
    List = 'LIST',
    Unit = 'UNIT'
}
