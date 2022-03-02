export interface UnitOfMeasure {
    "value": string,
    "text": string,
    "icon": any,
    "data": any
}

export function UnitOfMeasureValueToText(value: string | undefined, data: UnitOfMeasure[]): string {
    return data.filter(x => x.value === value)[0].text;
}

export function UnitOfMeasureTextToValue(text: string, data: UnitOfMeasure[]): string {
    return data.filter(x => x.text === text)[0].value;
}