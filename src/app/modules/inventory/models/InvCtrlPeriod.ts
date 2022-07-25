export interface InvCtrlPeriod {
    "id": number;
    "warehouseID": any;
    "warehouse": string;
    "dateFrom": string;
    "dateTo": string;
    "closed": boolean;
}

export function BlankInvCtrlPeriod(): InvCtrlPeriod {
    return {
        id: 0,
        warehouseID: '',
        warehouse: '',
        dateFrom: '',
        dateTo: '',
        closed: false
    } as InvCtrlPeriod
}