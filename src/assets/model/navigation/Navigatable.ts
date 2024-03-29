import { JumpPosPriority, PreferredSelectionMethod } from "src/app/services/keyboard-navigation.service";

export const TileCssClass: string = 'navmatrix-tile';
export const TileCssColClass: string = 'navmatrix-tile-col';

export enum AttachDirection { DOWN = -1, LEFT = -2, RIGHT = 2, UP = 1 };
export enum JumpDestination { LOWER_LEFT, LOWER_RIGHT, UPPER_LEFT, UPPER_RIGHT };
export enum NavMatrixOrientation { NORMAL, ONLY_HORIZONTAL, ONLY_VERTICAL };
export enum NavigatableType { form, table, inline_editable_table, submapping, menu, dialog, page, other }

// Interfaces

export interface INavigatable {
    Matrix: string[][];

    NavigatableType: NavigatableType

    IsMultiColMatrixGenEnabled?: boolean;

    LastX?: number;
    LastY?: number;

    HasSubMapping: boolean;
    SubMapping?: { [id: string]: INavigatable; };

    AlwaysFirstX?: number;
    AlwaysFirstY?: number;

    IsDialog: boolean;

    IsSubMapping: boolean;

    InnerJumpOnEnter: boolean;
    OuterJump: boolean;

    LeftNeighbour?: INavigatable;
    RightNeighbour?: INavigatable;
    DownNeighbour?: INavigatable;
    UpNeighbour?: INavigatable;

    DestWhenJumpedOnto?: JumpDestination;
    
    TileSelectionMethod: PreferredSelectionMethod;
    
    JumpPositionPriority?: JumpPosPriority;

    ClearNeighbours(): void;
    GenerateAndSetNavMatrices(attach: boolean, setAsCurrentNavigatable?: boolean, idToSelectAfterGenerate?: any): void;
    Attach(): void;
    Detach(): void;
}

// NullObject

export class NullNavigatable implements INavigatable {
    Matrix: string[][] = [[]];
    LastX?: number | undefined = undefined;
    LastY?: number | undefined = undefined;
    HasSubMapping: boolean = false;
    SubMapping?: { [id: string]: INavigatable; } | undefined;
    IsDialog: boolean = false;
    InnerJumpOnEnter: boolean = false;
    OuterJump: boolean = false;
    LeftNeighbour?: INavigatable | undefined;
    RightNeighbour?: INavigatable | undefined;
    DownNeighbour?: INavigatable | undefined;
    UpNeighbour?: INavigatable | undefined;
    NavigatableType = NavigatableType.other

    // Here it throws an error if we want to initialize it via
    // PreferredSelectionMethod.focus
    TileSelectionMethod: PreferredSelectionMethod = 0;

    IsSubMapping: boolean = false;

    private static _instance: NullNavigatable = new NullNavigatable();

    private constructor() { }

    ClearNeighbours(): void { }

    GenerateAndSetNavMatrices(attach: boolean): void { }
    Attach(): void { }
    Detach(): void { }

    public static get Instance(): NullNavigatable { return this._instance; }
}