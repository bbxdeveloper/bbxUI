import { IEditable } from "./IEditable";

export class Empty implements IEditable {
    IsUnfinished(): boolean {
        throw new Error("Method not implemented.");
    }
}