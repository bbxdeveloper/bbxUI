import { PreferredSelectionMethod } from "src/app/services/keyboard-navigation.service";
import { INavigatable } from "./Navigatable";

/**
 * Almenük és más, a fő navigációs mátrix alá rendelt elemek
 */
export class SubMappingNavigatable implements INavigatable {
    Matrix: string[][] = [];
    LastX?: number | undefined = undefined;
    LastY?: number | undefined = undefined;
    HasSubMapping: boolean = false;
    SubMapping?: { [id: string]: INavigatable; } | undefined;
    IsDialog: boolean = false;
    InnerJumpOnEnter: boolean = false;
    OuterJump: boolean = true;
    LeftNeighbour?: INavigatable | undefined;
    RightNeighbour?: INavigatable | undefined;
    DownNeighbour?: INavigatable | undefined;
    UpNeighbour?: INavigatable | undefined;
    TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

    IsSubMapping: boolean = true;

    constructor() { }

    ClearNeighbours(): void { }

    GenerateAndSetNavMatrices(attach: boolean): void { }
    Attach(): void { }
    Detach(): void { }
}
