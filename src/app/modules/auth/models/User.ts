import { IEditable } from "src/assets/model/IEditable";

export class User implements IEditable {
    password?: string;

    public static fromUserObject(user: User, warehouseForCombo: string|undefined): User {
      return new User(user.id, user.name, user.loginName, user.email, user.comment, user.active, user.warehouseID, user.warehouse, warehouseForCombo, user.userLevelX, user.userLevel)
    }

    public static createEmpty(): User {
      return new User(undefined, '', '', '', '', false, undefined, '', '', '', '')
    }

    constructor(
        public id: number|undefined,
        public name: string|undefined,
        public loginName: string|undefined,
        public email: string|undefined,
        public comment: string|undefined,
        public active: boolean|undefined,
        public warehouseID: number|undefined,
        public warehouse: string|undefined,
        public warehouseForCombo: string|undefined,
        public userLevel: string,
        public userLevelX: string) {
    }

    IsUnfinished(): boolean {
        return this.id === undefined || this.name === undefined ||
            this.loginName === undefined || this.email === undefined ||
            this.comment === undefined || this.active === undefined || this.warehouseID === 0;
    }
}
