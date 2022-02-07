export interface INavigatable {
    Matrix: string[][];

    LastX?: number;
    LastY?: number;

    HasSubMapping: boolean;
    SubMapping?: { [id: string]: INavigatable; };

    IsDialog: boolean;

    IsSubMapping: boolean;

    InnerJumpOnEnter: boolean;
    OuterJump: boolean;

    LeftNeighbour?: INavigatable;
    RightNeighbour?: INavigatable;
    DownNeighbour?: INavigatable;
    UpNeighbour?: INavigatable;

    ClearNeighbours(): void;
    GenerateAndSetNavMatrices(attach: boolean): void;
    Attach(): void;
    Detach(): void;
}
