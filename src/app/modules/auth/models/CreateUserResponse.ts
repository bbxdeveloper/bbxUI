import { User } from "./User";

export interface CreateUserResponse {
    "succeeded": boolean;
    "message"?: string;
    "errors"?: string[];
    "data"?: CreateUserResponseData;
}

export interface CreateUserResponseData {
    "id": number;
    "name": string;
    "email": string;
    "loginName": string;
    "comment": string;
    "active": boolean;
    "passwordHash": string;
    "deleted": boolean;
    "createTime": string;
    "uppdateTime": string;
}

export function CreateUserResponseDataToUser(u: CreateUserResponseData): User {
    return {
        id: u.id,
        name: u.name,
        loginName: u.loginName,
        active: u.active,
        comment: u.comment,
        email: u.email
    } as User;
}
