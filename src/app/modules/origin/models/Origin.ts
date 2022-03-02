export interface Origin {
    id: string;
    originCode: string;
    originDescription: string;
    createTime?: string;
    updateTime?: string,
    deleted?: boolean
}

export function BlankOrigin(): Origin {
    return {
        id: '0',
        originCode: '',
        originDescription: '',
        createTime: '',
        updateTime: '',
        deleted: false
    } as Origin;
}

export function OriginDescriptionToCode(originDescription: string, data: Origin[]): string {
    return data.filter(x => x.originDescription === originDescription)[0].originCode;
}

export function OriginCodeToDescription(originCode: string, data: Origin[]): string {
    return data.filter(x => x.originCode === originCode)[0].originDescription;
}