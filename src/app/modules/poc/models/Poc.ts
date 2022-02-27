export interface Poc {
    "id": number;
    "pocName"?: string;
    "pocType": string;
    "comment"?: string;
    "active"?: boolean
    "createTime"?: string;
    "updateTime"?: string;
    "deleted"?: boolean;
}

export function BlankPoc(): Poc {
    return {
        id: 0,
        pocName: '',
        pocType: '',
        comment: '',
        active: false,
        createTime: '',
        updateTime: '',
        deleted: false
    } as Poc;
}