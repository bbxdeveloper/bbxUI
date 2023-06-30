import { ChangeDetectorRef } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, JumpPosPriority } from "src/app/services/keyboard-navigation.service";
import { Constants } from "src/assets/util/Constants";
import { DefaultKeySettings, KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { IEditable } from "../IEditable";
import { IInlineManager } from "../IInlineManager";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { TreeGridNode } from "../TreeGridNode";
import { INavigatable, AttachDirection, TileCssClass, JumpDestination, NavigatableType } from "./Navigatable";
import { SelectedCell } from "./SelectedCell";

export class SimpleNavigatableTable<T = any> implements INavigatable {
    Matrix: string[][] = [[]];

    NavigatableType = NavigatableType.table

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

    TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

    IsSubMapping: boolean = false;

    kbS: KeyboardNavigationService;
    cdref: ChangeDetectorRef;
    
    DestWhenJumpedOnto?: JumpDestination;
    JumpPositionPriority?: JumpPosPriority;

    _data: any[];

    attachDirection: AttachDirection;

    tableId: string;

    data: TreeGridNode<T>[];
    dataSource: NbTreeGridDataSource<TreeGridNode<T>>;

    isUnfinishedRowDeletable: boolean = false;

    editedRow?: TreeGridNode<T>;
    editedProperty?: string;
    editedRowPos?: number;

    allColumns: string[];
    colDefs: ModelFieldDescriptor[];
    colsToIgnore: string[];

    idPrefix: string = '';

    selectedItem?: SelectedCell;
    parent: any;

    public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

    constructor(
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
        private kbs: KeyboardNavigationService,
        cdr: ChangeDetectorRef,
        data: any[],
        tableId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        parent: any
    ) {
        this.kbS = kbs;
        this.cdref = cdr;
        this._data = data;
        this.attachDirection = attachDirection;
        this.tableId = tableId;

        this.data = [];
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.allColumns = [];
        this.colDefs = [];
        this.colsToIgnore = [];

        this.parent = parent;
    }

    public ClearNeighbours(): void {
        this.LeftNeighbour = undefined;
        this.RightNeighbour = undefined;
        this.DownNeighbour = undefined;
        this.UpNeighbour = undefined;
    }

    HandleGridClick(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        console.log('[HandleGridClick]');

        this.kbs.setEditMode(KeyboardModes.NAVIGATION);

        // We can't assume all of the colDefs are displayed. We have to use the index of the col key from
        // the list of displayed rows.
        colPos = this.allColumns.findIndex(x => x === col);

        this.kbs.SetPosition(colPos, rowPos, this);
    }

    Attach(): void { }
    Detach(): void { }

    Setup(productsData: TreeGridNode<T>[], productsDataSource: NbTreeGridDataSource<TreeGridNode<T>>,
        allColumns: string[], colDefs: ModelFieldDescriptor[], colsToIgnore: string[] = [], _idPrefix: string
    ): void {
        // Set
        this.data = productsData;
        this.dataSource = productsDataSource;
        this.allColumns = allColumns;
        this.colDefs = colDefs;
        this.colsToIgnore = colsToIgnore;

        this.idPrefix = _idPrefix;
    }

    HandleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.cdref!.detectChanges();
        this.kbS.SelectCurrentElement();
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

    GenerateAndSetNavMatrices(attach: boolean, setAsCurrent: boolean = true): void {
        this.Matrix = [];

        for (let y = 0; y < this.data.length; y++) {
            let row = [];
            for (let x = 0; x < this.colDefs.length; x++) {
                if (this.colsToIgnore.findIndex(a => a === this.colDefs[x].objectKey) !== -1) {
                    continue;
                }
                row.push(this.idPrefix + "-" + x + '-' + y);
            }
            this.Matrix.push(row);
        }

        if (environment.debug) {
        }
        console.log('[GenerateAndSetNavMatrices]', this.Matrix);

        if (attach) {
            this.kbS.Attach(this, this.attachDirection, setAsCurrent);
        }
    }

    GenerateAndSetNavMatrices_(attach: boolean): void {
        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.tableId);

        if (environment.debug) {
            console.log('[GenerateAndSetNavMatrices]', this.tableId, tiles, '.' + TileCssClass, '#' + this.tableId);
        }

        let currentParent!: HTMLElement;

        // Prepare matrix
        this.Matrix = [[]];
        let currentMatrixIndex = 0;

        // Getting tiles, rows for navigation matrix
        for (let i = 0; i < tiles.length; i++) {
            const next = tiles[i];

            this.LogMatrixGenerationCycle(
                TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
            );

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
            this.kbS.Attach(this, this.attachDirection);
        }
    }

    HandleGridMovement(event: KeyboardEvent, row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, upward: boolean): void {
        // Új sorokat generáló sort nem dobhatjuk el.
        if (rowPos !== this.data.length - 1) {
            // Csak befejezetlen sort dobhatunk el, amikor nincs szerkesztésmód.
            let _data = row.data;
            if (!!_data && !this.kbS.isEditModeActivated) {
                switch (event.key) {
                    case "ArrowUp":
                        if (!this.isUnfinishedRowDeletable) {
                            return;
                        }
                        this.isUnfinishedRowDeletable = false;

                        this.data.splice(rowPos, 1);
                        this.dataSource.setData(this.data);

                        // Ha felfelé navigálunk, akkor egyet kell lefelé navigálnunk, hogy korrigáljuk a mozgást.
                        this.kbS.MoveDown();
                        this.GenerateAndSetNavMatrices(false);
                        break;
                    case "ArrowDown":
                        if (!this.isUnfinishedRowDeletable) {
                            return;
                        }
                        this.isUnfinishedRowDeletable = false;

                        this.data.splice(rowPos, 1);
                        this.dataSource.setData(this.data);

                        // Ha lefelé navigálunk, akkor egyet kell felfelé navigálnunk, hogy korrigáljuk a mozgást.
                        this.kbS.MoveUp();
                        this.GenerateAndSetNavMatrices(false);
                        break;
                }
            }
        }
    }

    HandleGridEnter(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        this.selectedItem = {
            row: row,
            rowPos: rowPos,
            col: col,
            colPos: colPos
        } as SelectedCell;
        this.parent.HandleItemChoice(this.selectedItem);
    }
}