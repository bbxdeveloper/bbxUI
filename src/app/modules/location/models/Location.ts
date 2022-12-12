export interface Location {
    id: number;
    locationCode: string;
    locationDescription: string;
    createTime?: string;
    updateTime?: string,
    deleted?: boolean
}

export function BlankLocation(): Location {
    return {
        id: 0,
        locationCode: '',
        locationDescription: '',
        createTime: '',
        updateTime: '',
        deleted: false
    } as Location;
}

export function LocationDescriptionToCode(locationDescription: string, data: Location[]): string {
    return data.filter(x => x.locationDescription === locationDescription)[0].locationCode;
}

export function LocationCodeToDescription(locationCode: string, data: Location[]): string {
    return data.filter(x => x.locationCode === locationCode)[0].locationDescription;
}