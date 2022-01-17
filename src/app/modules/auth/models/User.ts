import { IEditable } from "src/assets/model/IEditable";

export class User implements IEditable {
    Id?: string;
    UserName?: string;

    constructor(Id?: string, UserName?: string) {
        this.Id = Id;
        this.UserName = UserName;
    }

    IsUnfinished(): boolean {
        return this.Id === undefined || this.UserName === undefined;
    }
}