import { User } from "./User";

export interface UpdateUserResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: UpdateUserResponseData;
}

export class UpdateUserResponseData {
    "id": number;
    "usR_NAME": string;
    "usR_EMAIL": string;
    "usR_LOGIN": string;
    "usR_COMMENT": string;
    "usR_ACTIVE": boolean;
    "deleted": boolean;
    "createTime": string;
    "uppdateTime": string;

    constructor(
        p_id: number, p_usrName: string, p_usrEmail: string,
        p_usrLoginName: string, p_usrComment: string,
        p_usrActive: boolean,
        p_del: boolean, p_crT: string, p_upT: string) {
        this.id = p_id;
        this.usR_NAME = p_usrName;
        this.usR_EMAIL = p_usrEmail;
        this.usR_LOGIN = p_usrLoginName;
        this.usR_COMMENT = p_usrComment;
        this.usR_ACTIVE = p_usrActive;
        this.deleted = p_del;
        this.createTime = p_crT;
        this.uppdateTime = p_upT;
    }

    public ToUser(): User {
        return {
            id: this.id,
            name: this.usR_NAME,
            loginName: this.usR_LOGIN,
            active: this.usR_ACTIVE,
            comment: this.usR_COMMENT,
            email: this.usR_EMAIL
        } as User;
    }
}