import { WareHouse } from "../../warehouse/models/WareHouse";

export interface LoginDialogResponse {
    answer: boolean;
    name: string;
    pswd: string;
    wareHouse: WareHouse
}