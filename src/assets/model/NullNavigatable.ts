import { Nav } from "./Navigatable";

export class NullNavigatable implements Nav.INavigatable {
    Matrix: string[][] = [[]];
    LastX?: number | undefined = undefined;
    LastY?: number | undefined = undefined;
    HasSubMapping: boolean = false;
    SubMapping?: { [id: string]: Nav.INavigatable; } | undefined;
    IsDialog: boolean = false;
    InnerJumpOnEnter: boolean = false;
    OuterJump: boolean = false;
    LeftNeighbour?: Nav.INavigatable | undefined;
    RightNeighbour?: Nav.INavigatable | undefined;
    DownNeighbour?: Nav.INavigatable | undefined;
    UpNeighbour?: Nav.INavigatable | undefined;

    IsSubMapping: boolean = false;

    private static _instance: NullNavigatable = new NullNavigatable();

    private constructor() { }

    ClearNeighbours(): void { }

    GenerateAndSetNavMatrices(attach: boolean): void { }
    Attach(): void { }
    Detach(): void { }

    public static get Instance(): NullNavigatable { return this._instance; }
}