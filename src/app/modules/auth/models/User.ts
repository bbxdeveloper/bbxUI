import { IEditable } from "src/assets/model/IEditable";

export class User implements IEditable {
    id: number;
    name?: string;
    loginName?: string;
    email?: string;
    comment?: string;
    active?: boolean;

    password?: string;

    constructor(Id?: number, Name?: string, LoginName?: string, Email?: string, Comment?: string, Active?: boolean, password?: string) {
        this.id = Id ?? 0;
        this.name = Name;
        this.loginName = LoginName;
        this.email = Email;
        this.comment = Comment;
        this.active = Active === undefined ? true : Active;
    }

    IsUnfinished(): boolean {
        return this.id === undefined || this.name === undefined ||
            this.loginName === undefined || this.email === undefined ||
            this.comment === undefined || this.active === undefined;
    }
}