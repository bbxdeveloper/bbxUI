import { User } from "./User";

export interface UpdateUserResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: UpdateUserResponseData;
}

export interface UpdateUserResponseData {
    "id": number;
    "name": string;
    "email": string;
    "loginName": string;
    "comment": string;
    "active": boolean;
    "deleted": boolean;
    "createTime": string;
    "uppdateTime": string;
}

export function UpdateUserResponseDataToUser(u: UpdateUserResponseData): User {
    return {
        id: u.id,
        name: u.name,
        loginName: u.loginName,
        active: u.active,
        comment: u.comment,
        email: u.email
    } as User;
}
