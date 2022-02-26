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