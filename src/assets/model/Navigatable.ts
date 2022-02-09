import { ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyboardModes, KeyboardNavigationService, MoveRes, PreferredSelectionMethod } from 'src/app/services/keyboard-navigation.service';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';
import { NbSidebarService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { ModelFieldDescriptor } from './ColDef';
import { FooterCommandInfo } from './FooterCommandInfo';
import { TreeGridNode } from './TreeGridNode';
import { IEditable } from './IEditable';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdatable, IUpdater } from './UpdaterInterfaces';

/// <reference path='./INavigatable.ts'/>
/// <reference path='./NullNavigatable.ts'/>
export module Nav {

    export const TileCssClass: string = 'navmatrix-tile';

    export enum AttachDirection { DOWN = -1, LEFT = -2, RIGHT = 2, UP = 1 };

    // Interfaces

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

        TileSelectionMethod: PreferredSelectionMethod;

        ClearNeighbours(): void;
        GenerateAndSetNavMatrices(attach: boolean): void;
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

        // Here it throws an error if we want to initialize it via
        // PreferredSelectionMethod.focus
        TileSelectionMethod: PreferredSelectionMethod = 0;

        IsSubMapping: boolean = false;

        private static _instance: NullNavigatable = new NullNavigatable();

        private constructor() {}

        ClearNeighbours(): void { }

        GenerateAndSetNavMatrices(attach: boolean): void { }
        Attach(): void { }
        Detach(): void { }

        public static get Instance(): NullNavigatable { return this._instance; }
    }

    // Classes

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

    export class FlatDesignNavigatableTable<T extends IEditable> implements INavigatable, IUpdatable<T> {
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

        constructor(
            f: FormGroup,
            private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
            private kbs: KeyboardNavigationService,
            private fS: FooterService,
            private cdr: ChangeDetectorRef,
            data: any[],
            tableId: string,
            attachDirection: AttachDirection = AttachDirection.DOWN,
            formId: string,
            formAttachDirection: AttachDirection,
            private sidebarService: NbSidebarService,
            private sidebarFormService: SideBarFormService,
            private updater: IUpdater<T>
        ) {
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
        }

        New(data?: IUpdateRequest): void {
            this.updater.ActionNew(data);
            this.pushFooterCommandList();
        }

        Reset(data?: IUpdateRequest): void {
            this.updater.ActionReset(data);
            this.pushFooterCommandList();
        }

        Put(data?: IUpdateRequest): void {
            this.updater.ActionPut(data);
            this.pushFooterCommandList();
        }

        Delete(data?: IUpdateRequest): void {
            this.updater.ActionDelete(data);
            this.pushFooterCommandList();
        }

        public ClearNeighbours(): void {
            this.LeftNeighbour = undefined;
            this.RightNeighbour = undefined;
            this.DownNeighbour = undefined;
            this.UpNeighbour = undefined;
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

        pushFooterCommandList(): void {
            if (this.kbs.isEditModeActivated) {
                this.fS.pushCommands(this.commandsOnTableEditMode);
            } else {
                this.fS.pushCommands(this.commandsOnTable);
            }
        }

        handleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
            this.kbs.setEditMode(KeyboardModes.NAVIGATION);
            this.cdr!.detectChanges();
            this.kbs.SelectCurrentElement();
            this.pushFooterCommandList();
        }

        handleGridClick(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
            this.flatDesignForm.SetDataForEdit(row, rowPos, col);
            this.sidebarFormService.SetCurrentForm(this.flatDesignForm);

            this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
            this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;

            setTimeout(() => {
                this.flatDesignForm.GenerateAndSetNavMatrices(true, false);
            }, 200);
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
        }

        handleGridEnter(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string): void {
            this.flatDesignForm.SetDataForEdit(row, rowPos, col);
            this.sidebarFormService.SetCurrentForm(this.flatDesignForm);
            this.sidebarService.expand();

            this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
            this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;
            
            setTimeout(() => {
                this.flatDesignForm.GenerateAndSetNavMatrices(true, false);
            }, 200);
        }

        handleGridTab(event: Event): void {
            this.kbs.Jump(this.flatDesignForm.attachDirection);
            this.flatDesignForm.pushFooterCommandList();
        }
    }

    export class FlatDesignNavigatableForm<T extends IEditable = any> implements INavigatable, IUpdater<T> {
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

        TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

        IsSubMapping: boolean = false;

        form: FormGroup;

        _data: any[];

        attachDirection: AttachDirection;

        formId: string;

        colDefs: ModelFieldDescriptor[];

        PreviousXOnGrid: number = -1;
        PreviousYOnGrid: number = -1;

        private DataRowIndex: number = -1;
        private DataToEdit?: TreeGridNode<any>;

        readonly commandsOnForm: FooterCommandInfo[] = [
            { key: 'F3', value: '', disabled: false },
            { key: 'F4', value: '', disabled: false },
            { key: 'F5', value: '', disabled: false },
            { key: 'F6', value: '', disabled: false },
            { key: 'F7', value: '', disabled: false },
            { key: 'F8', value: 'Új', disabled: false },
            { key: 'F9', value: 'Alaphelyzet', disabled: false },
            { key: 'F10', value: 'Mentés', disabled: false },
            { key: 'F11', value: 'Törlés', disabled: false },
            { key: 'F12', value: 'Tétellap', disabled: false }
        ];

        constructor(
            f: FormGroup,
            private kbS: KeyboardNavigationService,
            private cdref: ChangeDetectorRef,
            data: any[],
            formId: string,
            attachDirection: AttachDirection = AttachDirection.DOWN,
            colDefs: ModelFieldDescriptor[],
            private sidebarService: NbSidebarService,
            private sidebarFormSercie: SideBarFormService,
            private grid: FlatDesignNavigatableTable<T>,
            private fS: FooterService
        ) {
            this.form = f;
            this._data = data;
            this.attachDirection = attachDirection;
            this.formId = formId;
            this.colDefs = colDefs;

            console.log("[ctor FlatDesignNavigatableForm] Params in order (without services): ", f, data, attachDirection, formId, colDefs); // TODO: only for debug

            this.sidebarService.onCollapse().subscribe({
                next: value => {
                    if (!!this.LeftNeighbour || !!this.RightNeighbour || !!this.DownNeighbour || !!this.UpNeighbour) {
                        this.Detach(this.PreviousXOnGrid, this.PreviousYOnGrid);
                        this.grid.pushFooterCommandList();
                    }
                }
            });
        }
        
        ActionNew(): void {
            this.sidebarService.collapse();

            this.grid.New({
                data: this.FillObjectWithForm(),
                rowIndex: this.DataRowIndex
            } as IUpdateRequest);
        }

        ActionReset(): void {
            this.sidebarService.collapse();

            this.grid.Reset({
                rowIndex: this.DataRowIndex
            } as IUpdateRequest);
        }

        ActionPut(): void {
            this.sidebarService.collapse();

            this.grid.Put({
                data: this.FillObjectWithForm(),
                rowIndex: this.DataRowIndex
            } as IUpdateRequest);
        }

        ActionDelete(): void {
            this.sidebarService.collapse();

            this.grid.Delete({
                rowIndex: this.DataRowIndex
            } as IUpdateRequest);
        }

        HandleFormEscape(): void {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.cdref.detectChanges();
        }

        public SetDataForEdit(row: TreeGridNode<any>, rowPos: number, objectKey: string): void {
            console.log("Form: ", this.form, ", row: ", row); // TODO: only for debug
            this.DataRowIndex = rowPos;
            this.DataToEdit = row;
            this.FillFormWithObject(this.DataToEdit?.data);
        }

        private FillObjectWithForm(): any {
            const data = {...this.DataToEdit?.data!};
            Object.keys(this.form.controls).forEach((x: string) => {
                data[x] = this.form.controls[x].value;
            });
            return data;
        }

        private FillFormWithObject(data: any): void {
            if (!!data) {
                Object.keys(this.form.controls).forEach((x: string) => {
                    this.form.controls[x].setValue(data[x]);
                });
            }
        }

        private FillFormAfterValueSelect(selectedValue: string, objectKey: string) {
            let buyer = this._data.find(b => b[objectKey] === selectedValue);
            if (!!buyer) {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== objectKey) {
                        this.form.controls[x].setValue(buyer[x]);
                    }
                });
            }
        }

        private MoveNext(): MoveRes {
            let moveRes = this.kbS.MoveRight(true, false, false);
            if (!moveRes.moved) {
                moveRes = this.kbS.MoveDown(true, false, true);
            }
            return moveRes;
        }

        private JumpToNextInput(event?: Event): void {
            const moveRes = this.MoveNext();
            // We can't know if we should click the first element if we moved to another navigation-matrix.
            if (!moveRes.jumped) {
                this.kbS.ClickCurrentElement();
                if (!this.kbS.isEditModeActivated) {
                    this.kbS.toggleEdit();
                }
            } else {
                // For example in case if we just moved onto a confirmation button in the next nav-matrix,
                // we don't want to automatically press it until the user directly presses enter after selecting it.
                if (!!event) {
                    event.stopImmediatePropagation();
                }
                // We jumped back to the grid we've just edited with this form
                this.sidebarService.collapse();
                this.Detach();
            }
        }

        HandleAutoCompleteSelect(event: any, key: string): void {
            if (event === "") {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== key) {
                        this.form.controls[x].setValue("");
                    }
                });
            } else {
                this.FillFormAfterValueSelect(event, key);
            }
            if (!this.kbS.isEditModeActivated) {
                this.JumpToNextInput(event);
            }
        }

        HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
            if (toggleEditMode) {
                this.kbS.toggleEdit();
            }
            // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
            if (!this.kbS.isEditModeActivated && jumpNext) {
                this.JumpToNextInput(event);
            }
        }

        pushFooterCommandList(): void {
            this.fS.pushCommands(this.commandsOnForm);
        }

        ClearNeighbours(): void {
            this.LeftNeighbour = undefined;
            this.RightNeighbour = undefined;
            this.DownNeighbour = undefined;
            this.UpNeighbour = undefined;
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

        GenerateAndSetNavMatrices(attach: boolean, setAsCurrentNavigatable: boolean = true): void {
            // Get tiles
            const tiles = $('.' + TileCssClass, '#' + this.formId);

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.formId, tiles, '.' + TileCssClass, '#' + this.formId);
            }

            let currentParent = '';

            // Prepare matrix
            this.Matrix = [[]];
            let currentMatrixIndex = 0;

            // Getting tiles, rows for navigation matrix
            for (let i = 0; i < tiles.length; i++) {
                const next = tiles[i];

                this.LogMatrixGenerationCycle(
                    TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
                );

                // Usually all form elements are in a nb-form-field
                // So we must examine the parent of that element to be sure two form element
                // is not in the same block
                if (!!next?.parentElement?.parentElement) {
                    const pE = next?.parentElement?.parentElement.nodeName;
                    if (pE !== currentParent) {
                        // currentParent was already initailized,
                        // so this parent name change must mean the tile is in another row
                        if (currentParent !== '') {
                            this.Matrix.push([]);
                            ++currentMatrixIndex;
                        }
                        currentParent = next.parentElement.nodeName;
                    }
                }

                next.id = TileCssClass + this.formId + '-' + Math.floor(Date.now() * Math.random());
                this.Matrix[currentMatrixIndex].push(next.id);
            }

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.Matrix);
            }

            if (attach) {
                this.kbS.Attach(this, this.attachDirection, setAsCurrentNavigatable);
            }
        }

        Attach(): void {
            this.kbS.Attach(this, this.attachDirection);
        }

        Detach(x?: number, y?: number): void {
            this.kbS.Detach(x, y);
        }
    }

    export class NavigatableTable<T extends IEditable> implements INavigatable {
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

        TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

        IsSubMapping: boolean = false;

        inlineForm: FormGroup;
        kbS: KeyboardNavigationService;
        cdref: ChangeDetectorRef;

        _data: any[];

        attachDirection: AttachDirection;

        tableId: string;

        data: TreeGridNode<T>[];
        dataSource: NbTreeGridDataSource<TreeGridNode<T>>;

        isUnfinishedRowDeletable: boolean = false;

        editedRow?: TreeGridNode<T>;
        editedProperty?: string;
        editedRowPos?: number;

        tableNavMap: string[][] = [];

        allColumns: string[];
        colDefs: ModelFieldDescriptor[];
        colsToIgnore: string[];

        productCreatorRow: TreeGridNode<T>;
        
        // private newDataInstance<A>(t: { new(): A; }): A { return new t(); }
        // get GenerateCreatorRow(): TreeGridNode<T> {
        //     return {
        //         data: this.newDataInstance(T)
        //     };
        // }

        getBlankInstance: () => T;
        get GenerateCreatorRow(): TreeGridNode<T> {
            return {
                data: this.getBlankInstance()
            };
        }

        readonly commandsOnTable: FooterCommandInfo[] = [];
        readonly commandsOnTableEditMode: FooterCommandInfo[] = [];

        constructor(
            f: FormGroup,
            private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
            private kbs: KeyboardNavigationService,
            private fS: FooterService,
            cdr: ChangeDetectorRef,
            data: any[],
            tableId: string,
            attachDirection: AttachDirection = AttachDirection.DOWN,
            getBlankInstance: () => T
        ) {
            this.inlineForm = f;
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
            this.inlineForm = new FormGroup({});
            
            this.getBlankInstance = getBlankInstance;
            this.productCreatorRow = this.GenerateCreatorRow;
        }

        public ClearNeighbours(): void {
            this.LeftNeighbour = undefined;
            this.RightNeighbour = undefined;
            this.DownNeighbour = undefined;
            this.UpNeighbour = undefined;
        }

        Attach(): void { }
        Detach(): void { }

        Setup(productsData: TreeGridNode<T>[], productsDataSource: NbTreeGridDataSource<TreeGridNode<T>>,
            allColumns: string[], colDefs: ModelFieldDescriptor[], cdref: ChangeDetectorRef, colsToIgnore: string[] = [], editedRow?: TreeGridNode<T>
        ): void {
            // Set
            this.data = productsData;
            this.dataSource = productsDataSource;
            this.allColumns = allColumns;
            this.colDefs = colDefs;
            this.colsToIgnore = colsToIgnore;
            this.editedRow = editedRow;
            this.cdref = cdref;

            // Init
            this.inlineForm = new FormGroup({});

            this.productCreatorRow = this.GenerateCreatorRow;
            this.data.push(this.productCreatorRow);

            this.dataSource.setData(this.data);

            this.resetEdit();
        }

        pushFooterCommandList(): void {
            if (this.kbS.isEditModeActivated) {
                this.fS.pushCommands(this.commandsOnTableEditMode);
            } else {
                this.fS.pushCommands(this.commandsOnTable);
            }
        }

        fillCurrentlyEditedRow(newRowData: TreeGridNode<T>): void {
            if (!!newRowData && !!this.editedRow) {
                this.editedRow.data = newRowData.data;
            }
            // if (!!newRowData && !!this.editedRow) {
            //     this.editedRow.data.ProductCode = newRowData.data.ProductCode;
            //     this.editedRow.data.Name = newRowData.data.Name;
            //     this.editedRow.data.Amount = newRowData.data.Amount;
            //     this.editedRow.data.Measure = newRowData.data.Measure;
            //     this.editedRow.data.Price = newRowData.data.Price;
            //     this.editedRow.data.Value = newRowData.data.Value;
            // }
        }

        resetEdit(): void {
            this.inlineForm = new FormGroup({});
            this.editedProperty = undefined;
            this.editedRow = undefined;
            this.editedRowPos = undefined;
        }

        edit(row: TreeGridNode<T>, rowPos: number, col: string) {
            this.inlineForm = new FormGroup({
                edited: new FormControl((row.data as any)[col])
            });
            this.editedProperty = col;
            this.editedRow = row;
            this.editedRowPos = rowPos;
        }

        handleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.resetEdit();
            this.cdref!.detectChanges();
            this.kbS.SelectCurrentElement();
            this.pushFooterCommandList();
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

        handleGridMovement(event: KeyboardEvent, row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, upward: boolean): void {
            // Új sorokat generáló sort nem dobhatjuk el.
            if (rowPos !== this.data.length - 1) {
                // Csak befejezetlen sort dobhatunk el, amikor nincs szerkesztésmód.
                let _data = row.data;
                if (!!_data && _data.IsUnfinished() && !this.kbS.isEditModeActivated) {
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

        handleGridEnter(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string): void {
            //debugger;

            // Switch between nav and edit mode
            let wasEditActivatedPreviously = this.kbS.isEditModeActivated;
            this.kbS.toggleEdit();

            // Already in Edit mode
            if (!!this.editedRow) {

                // Creator row edited
                if (rowPos === this.data.length - 1 && col === this.colDefs[0].colKey) {
                    this.productCreatorRow = this.GenerateCreatorRow;
                    this.data.push(this.productCreatorRow);

                    this.dataSource.setData(this.data);

                    this.GenerateAndSetNavMatrices(false);

                    this.isUnfinishedRowDeletable = true;
                }

                // this.kbS.toggleEdit();
                this.resetEdit();
                this.cdref!.detectChanges();

                let newX = this.moveNextInTable();
                if (wasEditActivatedPreviously) {
                    if (newX < colPos) {
                        this.isUnfinishedRowDeletable = false;
                    }
                    let nextRowPost = newX < colPos ? rowPos + 1 : rowPos;
                    let nextRow = newX < colPos ? this.data[nextRowPost] : row;
                    this.handleGridEnter(nextRow, nextRowPost, this.colDefs[newX].objectKey, newX, inputId);
                }
            } else {
                // Entering edit mode
                this.edit(row, rowPos, col);
                this.cdref!.detectChanges();
                this.kbS.SelectElement(inputId);
                const _input = document.getElementById(inputId) as HTMLInputElement;
                if (!!_input && _input.type === "text") {
                    window.setTimeout(function () {
                        const txtVal = ((row.data as any)[col] as string);
                        console.log(txtVal);
                        if (!!txtVal) {
                            _input.setSelectionRange(txtVal.length, txtVal.length);
                        } else {
                            _input.setSelectionRange(0, 0);
                        }
                    }, 0);
                }
            }

            this.pushFooterCommandList();

            console.log((this.data[rowPos].data as any)[col]);
        }

        handleGridDelete(event: Event, row: TreeGridNode<T>, rowPos: number, col: string): void {
            if (rowPos !== this.data.length - 1 && !this.kbS.isEditModeActivated) {
                this.data.splice(rowPos, 1);
                this.dataSource.setData(this.data);

                if (rowPos !== 0) {
                    this.kbS.MoveUp();
                }
                this.GenerateAndSetNavMatrices(false);
            }

            console.log((this.data[rowPos].data as any)[col]);
        }

        isEditingCell(rowIndex: number, col: string): boolean {
            return this.kbS.isEditModeActivated && !!this.editedRow && this.editedRowPos == rowIndex && this.editedProperty == col;
        }

        clearEdit(): void {
            this.editedRow = undefined;
            this.editedProperty = undefined;
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        }

        moveNextInTable(): number {
            let moveRes = this.kbS.MoveRight(true, false, false);
            if (!moveRes.moved) {
                moveRes = this.kbS.MoveDown(true, false, false);
                this.kbS.p.x = 0;
                this.kbS.SelectCurrentElement();
                return this.kbS.p.x;
            }
            return this.kbS.p.x;
        }
    }

    export class NavigatableForm implements INavigatable {
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

        TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

        IsSubMapping: boolean = false;

        form: FormGroup;
        kbS: KeyboardNavigationService;
        cdref: ChangeDetectorRef;

        _data: any[];

        attachDirection: AttachDirection;

        formId: string;

        constructor(
            f: FormGroup,
            kbs: KeyboardNavigationService,
            cdr: ChangeDetectorRef,
            data: any[],
            formId: string,
            attachDirection: AttachDirection = AttachDirection.DOWN
        ) {
            this.form = f;
            this.kbS = kbs;
            this.cdref = cdr;
            this._data = data;
            this.attachDirection = attachDirection;
            this.formId = formId;
        }

        HandleFormEscape(): void {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.cdref.detectChanges();
        }

        private FeelFormAfterValueSelect(selectedValue: string, objectKey: string) {
            let buyer = this._data.find(b => b[objectKey] === selectedValue);
            if (!!buyer) {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== objectKey) {
                        this.form.controls[x].setValue(buyer[x]);
                    }
                });
            }
        }

        private MoveNext(): MoveRes {
            let moveRes = this.kbS.MoveRight(true, false, false);
            if (!moveRes.moved) {
                moveRes = this.kbS.MoveDown(true, false, true);
            } 
            return moveRes;
        }

        private JumpToNextInput(event?: Event): void {
            const moveRes = this.MoveNext();
            // We can't know if we should click the first element if we moved to another navigation-matrix.
            if (!moveRes.jumped) {
                this.kbS.ClickCurrentElement();
                if (!this.kbS.isEditModeActivated) {
                    this.kbS.toggleEdit();
                }
            } else {
                // For example in case if we just moved onto a confirmation button in the next nav-matrix,
                // we don't want to automatically press it until the user directly presses enter after selecting it.
                if (!!event) {
                    event.stopImmediatePropagation();
                }
            }
        }

        HandleAutoCompleteSelect(event: any, key: string): void {
            if (event === "") {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== key) {
                        this.form.controls[x].setValue("");
                    }
                });
            } else {
                this.FeelFormAfterValueSelect(event, key);
            }
            if (!this.kbS.isEditModeActivated) {
                this.JumpToNextInput(event);
            }
        }

        HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
            if (toggleEditMode) {
                this.kbS.toggleEdit();
            }
            // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
            if (!this.kbS.isEditModeActivated && jumpNext) {
                this.JumpToNextInput(event);
            }
        }

        ClearNeighbours(): void {
            this.LeftNeighbour = undefined;
            this.RightNeighbour = undefined;
            this.DownNeighbour = undefined;
            this.UpNeighbour = undefined;
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
            const tiles = $('.' + TileCssClass, '#' + this.formId);

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.formId, tiles, '.' + TileCssClass, '#' + this.formId);
            }

            let currentParent = '';
            
            // Prepare matrix
            this.Matrix = [[]];
            let currentMatrixIndex = 0;

            // Getting tiles, rows for navigation matrix
            for (let i = 0; i < tiles.length; i++) {
                const next = tiles[i];

                this.LogMatrixGenerationCycle(
                    TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
                );

                // Usually all form elements are in a nb-form-field
                // So we must examine the parent of that element to be sure two form element
                // is not in the same block
                if (!!next?.parentElement?.parentElement) {
                    const pE = next?.parentElement?.parentElement.nodeName;
                    if (pE !== currentParent) {
                        // currentParent was already initailized,
                        // so this parent name change must mean the tile is in another row
                        if (currentParent !== '') {
                            this.Matrix.push([]);
                            ++currentMatrixIndex;
                        }
                        currentParent = next.parentElement.nodeName;
                    }
                }

                next.id = TileCssClass + this.formId + '-' + Math.floor(Date.now() * Math.random());
                this.Matrix[currentMatrixIndex].push(next.id);
            }

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.Matrix);
            }

            if (attach) {
                this.kbS.Attach(this, this.attachDirection);
            }
        }

        Attach(): void {
            this.kbS.Attach(this, this.attachDirection);
        }

        Detach(): void {}
    }

}
