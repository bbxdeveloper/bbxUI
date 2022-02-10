import { User } from "./User";

export interface CreateUserResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: CreateUserResponseData;
}

export interface CreateUserResponseData {
    "id": number;
    "usR_NAME": string;
    "usR_EMAIL": string;
    "usR_LOGIN": string;
    "usR_COMMENT": string;
    "usR_ACTIVE": boolean;
    "deleted": boolean;
    "createTime": string;
    "uppdateTime": string;
}

export function CreateUserResponseDataToUser(u: CreateUserResponseData): User {
    return {
        id: u.id,
        name: u.usR_NAME,
        loginName: u.usR_LOGIN,
        active: u.usR_ACTIVE,
        comment: u.usR_COMMENT,
        email: u.usR_EMAIL
    } as User;
}
