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

export const OfflineUnitOfMeasures = {
    PIECE: {
        "value": "PIECE",
        "text": "DB",
        "icon": null,
        "data": null
    },
    KILOGRAM: {
        "value": "KILOGRAM",
        "text": "Kg",
        "icon": null,
        "data": null
    },
    LITER: {
        "value": "LITER",
        "text": "Liter",
        "icon": null,
        "data": null
    },
    METER: {
        "value": "METER",
        "text": "m",
        "icon": null,
        "data": null
    },
    LINEAR_METER: {
        "value": "LINEAR_METER",
        "text": "FM",
        "icon": null,
        "data": null
    },
    PACK: {
        "value": "PACK",
        "text": "Doboz",
        "icon": null,
        "data": null
    },
    OWN: {
        "value": "OWN",
        "text": "Egyéb",
        "icon": null,
        "data": null
    },
}