import { IResponseSingleData } from "src/assets/model/IResponse";
import { User } from "./User";

export interface LoginResponseData {
    token: string;
    user: User;
}

export interface LoginResponse extends IResponseSingleData<LoginResponseData> {}