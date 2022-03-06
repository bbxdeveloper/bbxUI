import { User } from "./User";

export interface UpdateUserResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: UpdateUserResponseData;
}

export interface UpdateUserResponseData {
    "id": number;
    "usR_NAME": string;
    "usR_EMAIL": string;
    "usR_LOGIN": string;
    "usR_COMMENT": string;
    "usR_ACTIVE": boolean;
    "usR_PASSWDHASH": string;
    "deleted": boolean;
    "createTime": string;
    "uppdateTime": string;
}

export function UpdateUserResponseDataToUser(u: UpdateUserResponseData): User {
    return {
        id: u.id,
        name: u.usR_NAME,
        loginName: u.usR_LOGIN,
        active: u.usR_ACTIVE,
        comment: u.usR_COMMENT,
        email: u.usR_EMAIL,
        password: u.usR_PASSWDHASH
    } as User;
}
