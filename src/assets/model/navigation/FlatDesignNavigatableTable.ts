import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { BbxSidebarService } from "src/app/services/bbx-sidebar.service";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService } from "src/app/services/side-bar-form.service";
import { KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { SimplePaginator } from "../SimplePaginator";
import { TreeGridNode } from "../TreeGridNode";
import { IUpdatable, IUpdater, IUpdateRequest } from "../UpdaterInterfaces";
import { FlatDesignNavigatableForm } from "./FlatDesignNavigatableForm";
import { INavigatable, AttachDirection, TileCssClass } from "./Navigatable";

export class FlatDesignNavigatableTable<T> extends SimplePaginator implements INavigatable, IUpdatable<T> {
    Matrix: string[][] = [[]];

    LastX?: number | undefined;
    LastY?: number | undefined;

    HasSubMapping: boolean = false;
    SubMapping?: { [id: string]: INavigatable; } = undefined;

    IsDialog: boolean = false;

    InnerJumpOnEnter: boolean = true;
    OuterJump: boolean = false;

    LeftNeighbour?: INavigatable;
    RightNeighbour?: INavigatable;
    DownNeighbour?: INavigatable;
    UpNeighbour?: INavigatable;

    TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.both;

    IsSubMapping: boolean = false;

    _data: any[];

    attachDirection: AttachDirection;

    tableId: string;

    data: TreeGridNode<T>[];
    dataSource: NbTreeGridDataSource<TreeGridNode<T>>;

    editedRow?: TreeGridNode<T>;
    editedProperty?: string;
    editedRowPos?: number;

    tableNavMap: string[][] = [];

    allColumns: string[];
    colDefs: ModelFieldDescriptor[];
    colsToIgnore: string[];

    flatDesignForm: FlatDesignNavigatableForm<T>;

    readonly commandsOnTable: FooterCommandInfo[] = [
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: '', disabled: false },
        { key: 'F3', value: '', disabled: false },
        { key: 'F4', value: '', disabled: false },
        { key: 'F5', value: '', disabled: false },
        { key: 'F6', value: '', disabled: false },
        { key: 'F7', value: '', disabled: false },
        { key: 'F8', value: '', disabled: false },
        { key: 'F9', value: '', disabled: false },
        { key: 'F10', value: '', disabled: false },
        { key: 'F11', value: '', disabled: false },
        { key: 'F12', value: 'Tétellap', disabled: false }
    ];
    readonly commandsOnTableEditMode: FooterCommandInfo[] = this.commandsOnTable;

    private prevSelectedRow?: TreeGridNode<T>;
    private prevSelectedRowPos?: number;
    private prevSelectedCol?: string;
    private prevSelectedColPos?: number;

    private tag: string = '';

    getBlankInstance: () => T;
    get GenerateCreatorRow(): TreeGridNode<T> {
        return {
            data: this.getBlankInstance()
        };
    }

    constructor(
        f: FormGroup,
        tag: string,
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
        private kbs: KeyboardNavigationService,
        private fS: FooterService,
        private cdr: ChangeDetectorRef,
        data: any[],
        tableId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        formId: string,
        formAttachDirection: AttachDirection,
        private sidebarService: BbxSidebarService,
        private sidebarFormService: SideBarFormService,
        private updater: IUpdater<T>,
        getBlankInstance: () => T
    ) {
        super();

        this._data = data;
        this.attachDirection = attachDirection;
        this.tableId = tableId;

        this.data = [];
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.allColumns = [];
        this.colDefs = [];
        this.colsToIgnore = [];

        this.flatDesignForm = new FlatDesignNavigatableForm(
            f, this.kbs, this.cdr, data, formId, formAttachDirection, this.colDefs, this.sidebarService, this.sidebarFormService, this, this.fS
        );

        this.tag = tag;

        this.getBlankInstance = getBlankInstance;
    }

    New(data?: IUpdateRequest): void {
        this.updater.ActionNew(data);
        this.PushFooterCommandList();
    }

    Reset(data?: IUpdateRequest): void {
        this.updater.ActionReset(data);
        this.PushFooterCommandList();
    }

    Put(data?: IUpdateRequest): void {
        this.updater.ActionPut(data);
        this.PushFooterCommandList();
    }

    Delete(data?: IUpdateRequest): void {
        this.updater.ActionDelete(data);
        this.PushFooterCommandList();
    }

    public ClearNeighbours(): void {
        this.LeftNeighbour = undefined;
        this.RightNeighbour = undefined;
        this.DownNeighbour = undefined;
        this.UpNeighbour = undefined;
    }

    ResetForm(): void {
        this.HandleGridClick(
            this.prevSelectedRow!,
            this.prevSelectedRowPos!,
            this.prevSelectedCol!,
            this.prevSelectedColPos!
        );
    }

    Attach(): void { }
    Detach(): void { }

    Setup(productsData: TreeGridNode<T>[], productsDataSource: NbTreeGridDataSource<TreeGridNode<T>>,
        allColumns: string[], colDefs: ModelFieldDescriptor[], colsToIgnore: string[] = [], editedRow?: TreeGridNode<T>
    ): void {
        // Set
        this.data = productsData;
        this.dataSource = productsDataSource;
        this.allColumns = allColumns;
        this.colDefs = colDefs;
        this.colsToIgnore = colsToIgnore;
        this.editedRow = editedRow;

        this.dataSource.setData(this.data);

        this.flatDesignForm.colDefs = this.colDefs;
        this.flatDesignForm.OuterJump = true;
    }

    PushFooterCommandList(): void {
        if (this.kbs.isEditModeActivated) {
            this.fS.pushCommands(this.commandsOnTableEditMode);
        } else {
            this.fS.pushCommands(this.commandsOnTable);
        }
    }

    HandleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        this.kbs.setEditMode(KeyboardModes.NAVIGATION);
        this.cdr!.detectChanges();
        this.kbs.SelectCurrentElement();
        this.PushFooterCommandList();
    }

    SetBlankInstanceForForm(openSideBar: boolean, jump: boolean = true): void {
        const creatorRow = this.GenerateCreatorRow;

        console.log(`Blank instance: ${creatorRow}`);

        this.prevSelectedRow = creatorRow;
        this.prevSelectedRowPos = -1;
        this.prevSelectedCol = '';
        this.prevSelectedColPos = -1;

        this.flatDesignForm.SetDataForEdit(creatorRow, -1, '');
        this.sidebarFormService.SetCurrentForm([this.tag, this.flatDesignForm]);
        
        this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
        this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;
        
        this.flatDesignForm.SetClean();
        
        setTimeout(() => {
            if (openSideBar) {
                this.sidebarService.toggle();
            }

            this.flatDesignForm.GenerateAndSetNavMatrices(true, true);

            if (jump) {
                this.kbs.Jump(this.flatDesignForm.attachDirection, true);
            }

            this.flatDesignForm.PushFooterCommandList();
        }, 200);
    }

    HandleGridClick(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        // In case user clicks with mouse, we adjust our coordinate to the click

        // We can't assume all of the colDefs are displayed. We have to use the index of the col key from
        // the list of displayed rows.
        colPos = this.allColumns.findIndex(x => x === col);

        this.kbs.SetPosition(colPos, rowPos, this);

        this.prevSelectedRow = row;
        this.prevSelectedRowPos = rowPos;
        this.prevSelectedCol = col;
        this.prevSelectedColPos = colPos;

        this.flatDesignForm.SetDataForEdit(row, rowPos, col);
        this.sidebarFormService.SetCurrentForm([this.tag, this.flatDesignForm]);

        this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
        this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;

        this.flatDesignForm.GenerateAndSetNavMatrices(true, false);
    }

    private LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
        if (environment.debug) {
            console.log("\n\n+---- MATRIX GEN ----+");
            console.log(`Time: ${Date.now().toLocaleString()}`);

            console.log(`Current node: ${node}`);
            console.log(`Parent: ${parent}`);
            console.log(`Grandparent: ${grandParent}`);

            console.log(`CSS Class: ${cssClass}`);

            console.log(`Total tiles: ${totalTiles}`);

            console.log("+------------------+\n\n");
        }
    }

    GenerateAndSetNavMatrices(attach: boolean): void {
        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.tableId);

        // if (environment.debug) {
        //     console.log('[GenerateAndSetNavMatrices] Data: ', this.data);
        //     console.log('[GenerateAndSetNavMatrices]', 'Tiles: ', tiles, 'Css class: ', '.' + TileCssClass, '#TableID: ', '#' + this.tableId);
        // }

        let currentParent!: HTMLElement;

        // Prepare matrix
        this.Matrix = [[]];
        let currentMatrixIndex = 0;

        // Getting tiles, rows for navigation matrix
        for (let i = 0; i < tiles.length; i++) {
            const next = tiles[i];

            // this.LogMatrixGenerationCycle(
            //     TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
            // );

            // Usually all table cells are in a tr (parentElement here)
            if (!!next?.parentElement) {
                const pE = next?.parentElement;
                if (pE !== currentParent) {
                    // currentParent was already initailized,
                    // so this parent name change must mean the tile is in another row
                    if (!!currentParent) {
                        this.Matrix.push([]);
                        ++currentMatrixIndex;
                    }
                    currentParent = next.parentElement;
                }
            }

            next.id = TileCssClass + this.tableId + '-' + Math.floor(Date.now() * Math.random());
            this.Matrix[currentMatrixIndex].push(next.id);
        }

        if (environment.debug) {
            console.log('[GenerateAndSetNavMatrices]', this.Matrix);
        }

        if (attach) {
            this.kbs.Attach(this, this.attachDirection);
        }

        // this.kbs.LogMatrix();
    }

    HandleKey(event: any): void {
        switch (event.key) {
            case KeyBindings.F12: {
                event.preventDefault();
                if (this.data.length === 0) {
                    this.SetBlankInstanceForForm(true);
                } else {
                    this.sidebarService.toggle();
                }
                break;
            }
            default: { }
        }
    }

    JumpToFlatDesignForm(tabKeyDownEvent?: Event, row?: TreeGridNode<T>, rowPos?: number, col?: string, colPos?: number): void {
        tabKeyDownEvent?.preventDefault();
        tabKeyDownEvent?.stopImmediatePropagation();
        tabKeyDownEvent?.stopPropagation();
        
        if (row !== undefined && rowPos !== undefined && col !== undefined && colPos !== undefined) {
            this.HandleGridClick(row, rowPos, col, colPos);
        }
        
        this.kbs.Jump(this.flatDesignForm.attachDirection, true);
        this.flatDesignForm.PushFooterCommandList();
    }
}