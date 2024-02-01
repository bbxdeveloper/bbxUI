import { ChangeDetectorRef, EventEmitter } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { FORMATTED_NUMBER_COL_TYPES } from "src/app/modules/shared/flat-design-table/flat-design-table.component";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { Constants } from "src/assets/util/Constants";
import { DefaultKeySettings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { IEditable } from "../IEditable";
import { IInlineManager } from "../IInlineManager";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { TreeGridNode } from "../TreeGridNode";
import { INavigatable, AttachDirection, TileCssClass, NavigatableType } from "./Navigatable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";
import { BehaviorSubject } from "rxjs";


export class InlineEditableNavigatableTable<T extends IEditable> implements INavigatable {
    Matrix: string[][] = [[]];

    NavigatableType = NavigatableType.inline_editable_table

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

    RestoreMementoObjectStateOnEscape = true;
    MementoObjectField?: string = undefined;

    IsSubMapping: boolean = false;

    inlineForm: FormGroup;
    kbS: KeyboardNavigationService;
    cdref: ChangeDetectorRef;

    _data: any[];

    attachDirection: AttachDirection;

    tableId: string;

    data: TreeGridNode<T>[];
    dataSource: NbTreeGridDataSource<TreeGridNode<T>>;

    /**
     * Row added
     * [added row, length after add (without editor row)]
     */
    rowAdded: BehaviorSubject<any> = new BehaviorSubject<any>([undefined, undefined])
    /**
     * Row deleted
     * [deleted row, length after delete (without editor row)]
     */
    rowDeleted: BehaviorSubject<any> = new BehaviorSubject<any>([undefined, undefined])
    /**
     * Row possibly modified
     * [modified row, row pos]
     */
    rowModified: BehaviorSubject<any> = new BehaviorSubject<any>([undefined, undefined])

    isUnfinishedRowDeletable: boolean = false;

    editedRow?: TreeGridNode<T>;
    editedProperty?: string;
    editedRowPos?: number;

    tableNavMap: string[][] = [];

    allColumns: string[];
    colDefs: ModelFieldDescriptor[];
    colsToIgnore: string[];

    get isEditModeOff() {
        return !this.kbS.isEditModeActivated;
    }

    productCreatorRow: TreeGridNode<T>;

    getBlankInstance: () => T;
    get GenerateCreatorRow(): TreeGridNode<T> {
        return {
            data: this.getBlankInstance()
        };
    }

    commandsOnTable: FooterCommandInfo[] = [
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: 'Keresés', disabled: false },
        { key: 'Ctrl+Enter', value: 'Mentés (csak teljes kitöltöttség esetén)', disabled: false },
        { key: 'Delete', value: 'Sor törlése (csak navigációs módban)', disabled: false },
        { key: 'F5', value: '', disabled: false },
        { key: 'F6', value: '', disabled: false },
        { key: 'F7', value: '', disabled: false },
        { key: 'F8', value: '', disabled: false },
        { key: 'F9', value: '', disabled: false },
        { key: 'F10', value: '', disabled: false },
    ];
    commandsOnTableEditMode: FooterCommandInfo[] = [
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: 'Keresés', disabled: false },
        { key: 'Ctrl+Enter', value: 'Mentés (csak teljes kitöltöttség esetén)', disabled: false },
        { key: 'F4', value: '', disabled: false },
        { key: 'F5', value: '', disabled: false },
        { key: 'F6', value: '', disabled: false },
        { key: 'F7', value: '', disabled: false },
        { key: 'F8', value: '', disabled: false },
        { key: 'F9', value: '', disabled: false },
        { key: 'F10', value: '', disabled: false },
    ];

    idPrefix: string = '';
    parentComponent: IInlineManager;

    public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

    /**
     * Pressing enter doesn't move the navigation to the next cell
     */
    public repairMode: boolean = false;
    mechanicalClick = false;

    constructor(
        private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<T>>,
        private kbs: KeyboardNavigationService,
        private fS: FooterService,
        cdr: ChangeDetectorRef,
        data: any[],
        tableId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        getBlankInstance: () => T,
        parentComponent: IInlineManager
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
        this.inlineForm = new FormGroup({});

        this.getBlankInstance = getBlankInstance;
        this.productCreatorRow = this.GenerateCreatorRow;

        this.parentComponent = parentComponent;
    }

    public TestFill(amount: number = 50, timeout: number = 3000): void {
        setTimeout(() => {
            for (let i = 0; i < amount; i++) {
                this.data.push(this.GenerateCreatorRow);
            }
            this.dataSource.setData(this.data);
            this.GenerateAndSetNavMatrices(false);
        }, timeout);
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
        allColumns: string[], colDefs: ModelFieldDescriptor[], colsToIgnore: string[] = [], _idPrefix: string, editedRow?: TreeGridNode<T>
    ): void {
        // Set
        this.data = productsData;
        this.dataSource = productsDataSource;
        this.allColumns = allColumns;
        this.colDefs = colDefs;
        this.colsToIgnore = colsToIgnore;
        this.editedRow = editedRow;

        // Init
        this.inlineForm = new FormGroup({});

        this.SetCreatorRow();

        this.idPrefix = _idPrefix;

        this.ResetEdit();
    }

    ClickByObjectKey(objectKey: string, timeout: number = 200, yIndex: number|undefined = undefined): void {
        setTimeout(() => {
            const filteredCols = this.colDefs.filter(x => !this.colsToIgnore.includes(x.objectKey))
            const nextIndex = filteredCols.findIndex(x => x.objectKey.toLowerCase() === objectKey.toLowerCase())
            this.kbS.setEditMode(KeyboardModes.NAVIGATION)
            const y = yIndex ?? this.kbS.p.y
            this.kbS.SelectElementByCoordinate(nextIndex, y)
            this.kbS.ClickCurrentElement()
        }, timeout);
    }

    SetCreatorRow(): void {
        if (this.data.length === 0 || (this.data.length > 0 && !this.data[this.data.length - 1].data.IsUnfinished())) {
            this.productCreatorRow = this.GenerateCreatorRow;
            this.data.push(this.productCreatorRow);
        }
        this.dataSource.setData(this.data);
    }

    PushFooterCommandList(): void {
        // if (this.kbS.isEditModeActivated) {
        //     this.fS.pushCommands(this.commandsOnTableEditMode);
        // } else {
        //     this.fS.pushCommands(this.commandsOnTable);
        // }
    }

    GetEditedRow(): TreeGridNode<T> | undefined {
        return this.editedRow;
    }

    /**
     * Fills currently edited row with new row data.
     * @param newRowData
     * @param checkForChange Don't overwrite currently edited row data if the checked field values are the same.
     * @returns
     */
    FillCurrentlyEditedRow(newRowData: TreeGridNode<T>, checkForChange: string[] = [], checkForChangeCaseInsensitive: boolean = false): TreeGridNode<T> | undefined {
        if (!!newRowData && !!this.editedRow) {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);

            const rowData = this.data[this.editedRowPos!]?.data as any
            if (!rowData || checkForChange.length === 0) {
                this.data[this.editedRowPos!] = newRowData;
            } else {
                for (let i = 0; i < checkForChange.length; i++) {
                    var key = checkForChange[i]
                    if (rowData.Changed(key, checkForChangeCaseInsensitive, (newRowData.data as any)[key])) {
                        this.data[this.editedRowPos!] = newRowData;
                        break
                    }
                }
            }

            var currentRow = this.data[this.editedRowPos!];

            this.SetCreatorRow();
            this.ResetEdit();

            this.GenerateAndSetNavMatrices(false);

            setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                this.parentComponent.TableRowDataChanged(newRowData.data, this.editedRowPos);
            }, 100);

            return currentRow;
        }

        return undefined;
    }

    /**
     * Adding a range of nodes to the grid.
     * Only recommended for empty tables. Editor-row will be recreated during the process.
     * Change events won't be fired!
     * @param items Nodes to add.
     * @param defaultSaveField For MementoObject, the data call Save with this field during addition.
     */
    public AddRange(items: TreeGridNode<T>[], defaultSaveField: string = ''): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);

        this.data.splice(this.data.length - 1, 1)

        for (let i = 0; i < items.length; i++) {
            if (!HelperFunctions.isEmptyOrSpaces(defaultSaveField)) {
                (items[i].data as any).Save(defaultSaveField)
            }

            this.data.push(items[i])
        }
        this.dataSource.setData(this.data)
        this.GenerateAndSetNavMatrices(false)

        this.SetCreatorRow()
        this.ResetEdit()

        this.GenerateAndSetNavMatrices(false)

        setTimeout(() => {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        }, 100)
    }

    ResetEdit(): void {
        this.inlineForm = new FormGroup({});
        this.editedProperty = undefined;
        this.editedRow = undefined;
        this.editedRowPos = undefined;
    }

    Edit(row: TreeGridNode<T>, rowPos: number, col: string) {
        this.inlineForm = new FormGroup({
            edited: new FormControl((row.data as any)[col])
        });
        this.editedProperty = col;
        this.editedRow = row;
        this.editedRowPos = rowPos;
    }

    HandleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, restoreMementoObjectState: boolean = false): void {
        if (row && (this.RestoreMementoObjectStateOnEscape || restoreMementoObjectState)) {
            (row.data as any).Restore(this.MementoObjectField);
        }
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.ResetEdit();
        this.cdref!.detectChanges();
        this.kbS.SelectCurrentElement();
        this.PushFooterCommandList();
        this.repairMode = true;
        this.rowModified.next([row, rowPos])
    }

    private LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
        if (environment.inlineEditableTableMatrixGenerationLog) {
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

    /**
     * Sanity check to decide if the list of all rendered coloumns contains all the skipped ones.
     * Skipping coloumns that are not part of the table can lead to navigation errors!
     */
    private checkColoumnLists(): void {
        if (!this.colsToIgnore || this.colsToIgnore.length === 0) {
            return
        }
        this.colsToIgnore.forEach(ignoredColumn => {
            if (this.allColumns.findIndex(normalColumn => normalColumn === ignoredColumn) === -1) {
                throw new Error(`Skipped columns (colsToIgnore) in navigation includes column (${ignoredColumn}) not present in the list of all table columns (allColumns)!`)
            }
        })
    }

    GenerateAndSetNavMatrices(attach: boolean, afterSort: boolean = false): void {
        this.Matrix = [];

        this.checkColoumnLists()

        for (let y = 0; y < this.data.length; y++) {
            let row = [];
            for (let x = 0; x < this.colDefs.length; x++) {
                if (this.colsToIgnore.findIndex(a => a === this.colDefs[x].objectKey) !== -1) {
                    // console.log(`Col ${this.colDefs[x].objectKey}, ${this.idPrefix + "-" + x + '-' + y} ignored in matrix generation as requested.`)
                    continue;
                }
                // console.log(`Col ${this.colDefs[x].objectKey}, ${this.idPrefix + "-" + x + '-' + y} pushed.`)
                row.push(this.idPrefix + "-" + x + '-' + y);
            }
            this.Matrix.push(row);
        }

        if (environment.inlineEditableTableMatrixGenerationLog) {
            console.log('[GenerateAndSetNavMatrices]', this.Matrix);
        }

        if (attach) {
            this.kbS.Attach(this, this.attachDirection);
        }

        if (afterSort) {
            const tempX = this.kbs.p.x;
            const tempY = this.kbs.p.y;

            this.RemoveEditRow(false);

            if (environment.inlineEditableTableMatrixGenerationLog) {
                console.log('selectPreviousPoseAfterGenerate: ', this.Matrix, tempX, tempY, this.kbs.IsCurrentNavigatable(this));
            }

            this.cdref.detectChanges();

            this.kbs.SelectElementByCoordinate(tempX, tempY);

            if (environment.inlineEditableTableMatrixGenerationLog) {
                console.log(this.kbs.Here, this.Matrix[2].includes(this.kbs.Here));
            }

            this.SetCreatorRow();
        }
    }

    GenerateAndSetNavMatrices_(attach: boolean): void {
        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.tableId);

        if (environment.inlineEditableTableMatrixGenerationLog) {
            console.log('[GenerateAndSetNavMatrices]', this.tableId, tiles, '.' + TileCssClass, '#' + this.tableId);
        }

        let currentParent!: HTMLElement;

        // Prepare matrix
        this.Matrix = [[]];
        let currentMatrixIndex = 0;

        this.checkColoumnLists()

        // Getting tiles, rows for navigation matrix
        for (let i = 0; i < tiles.length; i++) {
            const next = tiles[i];

            if (environment.inlineEditableTableMatrixGenerationLog) {
                this.LogMatrixGenerationCycle(
                    TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
                );
            }

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

        if (environment.inlineEditableTableMatrixGenerationLog) {
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
            if (!!_data && _data.IsUnfinished() && !this.kbS.isEditModeActivated) {
                switch (event.key) {
                    case "ArrowUp":
                        if (!this.isUnfinishedRowDeletable) {
                            return;
                        }
                        this.isUnfinishedRowDeletable = false;

                        this.rowDeleted.next([this.data[rowPos], this.data.length - 1])

                        this.data.splice(rowPos, 1);
                        this.dataSource.setData(this.data);

                        // Ha felfelé navigálunk, akkor egyet kell lefelé navigálnunk, hogy korrigáljuk a mozgást.
                        this.GenerateAndSetNavMatrices(false);

                        setTimeout(() => {
                            this.kbS.MoveDown();
                        }, 50);

                        break;
                    case "ArrowDown":
                        if (!this.isUnfinishedRowDeletable) {
                            return;
                        }
                        this.isUnfinishedRowDeletable = false;

                        this.rowDeleted.next([this.data[rowPos], this.data.length - 1])

                        this.data.splice(rowPos, 1);
                        this.dataSource.setData(this.data);

                        // Ha lefelé navigálunk, akkor egyet kell felfelé navigálnunk, hogy korrigáljuk a mozgást.
                        this.kbS.MoveUp();
                        this.GenerateAndSetNavMatrices(false);
                        break;
                }
            }
        }
        this.rowModified.next([undefined, undefined])
    }

    HandleGridClick(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, mouseClick: boolean = false, clickEvent?: any, navigatable?: INavigatable): void {
        if (this.colDefs.find(x => x.colKey === col)?.fReadonly ?? false) {
            return
        }

        let firstCol = colPos === 0;

        const fromEditMode = !this.kbs.isNavigationModeActivated;

        if (firstCol) {
            this.kbs.setEditMode(KeyboardModes.NAVIGATION);
        } else {
            if (fromEditMode) {
                this.kbs.setEditMode(KeyboardModes.EDIT);
            } else {
                this.kbs.setEditMode(KeyboardModes.NAVIGATION);
            }
        }

        this.ResetEdit();

        // We can't assume all of the colDefs are displayed. We have to use the index of the col key from
        // the list of displayed rows.
        colPos = this.allColumns.filter(x => !this.colsToIgnore.includes(x)).findIndex(x => x === col);

        this.kbs.SetPosition(colPos, rowPos, this);

        this.HandleGridEnter(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, mouseClick, navigatable);
    }

    HandleGridEnter(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
        if (environment.inlineEditableTableKeyboardDebug) {
            console.log(this.constructor.name, this.HandleGridEnter.name)
        }
        switch (this.kbS.currentKeyboardMode) {
            case KeyboardModes.NAVIGATION: {
                // Only for first cols of new rows.
                if (colPos == 0 && rowPos === this.data.length - 1) {
                    this.HandleGridEnterOld(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable)
                } else {
                    this.Edit(row, rowPos, col);
                    this.kbS.setEditMode(KeyboardModes.NAVIGATION_EDIT)
                    this.SelectInputChar(inputId, fInputType ?? '', row, col)
                }
                break
            }
            case KeyboardModes.EDIT: {
                // Standard case for ENTER key
                this.HandleGridEnterOld(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable)
                // Refocus current element
                this.kbs.SelectCurrentElement()
                break
            }
            case KeyboardModes.NAVIGATION_EDIT: {
                if (colPos == 0 && rowPos !== this.data.length - 1) {
                    // Standard case for ENTER key
                    this.HandleGridEnterOld(row, rowPos, col, colPos, inputId, fInputType, fromEditMode, fromClickMethod, navigatable)
                    // Refocus current element
                    this.kbs.SelectCurrentElement()
                } else {
                    // Cache edited data
                    let tmp: T | undefined = this.editedRow?.data;
                    // Clear edit data
                    this.ResetEdit();
                    // Detect changes in DOM
                    this.cdref!.detectChanges();
                    // Set mode
                    this.kbS.setEditMode(KeyboardModes.NAVIGATION)
                    // Notify the parent component about the datachange
                    this.parentComponent.TableRowDataChanged(tmp, rowPos, col)
                    // Refresh parent
                    this.parentComponent.RecalcNetAndVat()
                    // Refocus current element
                    this.kbs.SelectCurrentElement()
                }
                break
            }
        }
        this.rowModified.next([row, rowPos])
    }

    private HandleGridEnterOld(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string, fromEditMode: boolean = true, fromClickMethod: boolean = false, navigatable?: INavigatable): void {
        // Is there a currently edited row?
        let wasEditActivatedPreviously = !this.kbS.isNavigationModeActivated && !!this.editedRow;
        let firstCol = colPos === 0;

        if (environment.inlineEditableTableKeyboardDebug) {
            console.log(navigatable);
        }

        if ((navigatable !== undefined && (this !== navigatable))) {
            this.repairMode = true;
        }

        if (firstCol) {
            this.repairMode = false;
        }

        // Stats
        if (environment.inlineEditableTableKeyboardDebug) {
            console.log(
                `            ==========[HandleGridEnter]========
                wasEditActivatedPreviously: ${wasEditActivatedPreviously}, IS EDIT MODE: ${this.kbS.isEditModeActivated},
                ROW: ${row}, EDITEDROW: ${this.editedRow}, ROWPOS: ${rowPos}, COL: ${col}, COLPOS: ${colPos},
                INPUT ID: ${inputId}, F INPUT TYPE: ${fInputType}, IS UNFINISHED: ${row.data.IsUnfinished()}
                --------------
                repair: ${this.repairMode}, fromEditMode: ${fromEditMode}, fromClickMethod: ${fromClickMethod}, this.kbs.isEditModeActivated: ${this.kbs.isEditModeActivated}
                first column: ${colPos === 0}, mechanical click: ${this.mechanicalClick}
                ===================================`
            );
        }


        // Cache edited data
        let tmp: T | undefined = this.editedRow?.data;

        // Switch modes
        if (firstCol)
            this.kbS.toggleEdit();

        // Set timeout can cause checkboxes to malfunction
        if (this.kbs.IsInnerInputCheckbox()) {
            // Already in Edit mode
            if (wasEditActivatedPreviously && !!tmp) {

                // New blank row if needed
                if (rowPos === this.data.length - 1 && col === this.colDefs[0].colKey && !tmp.IsUnfinished()) {
                    this.productCreatorRow = this.GenerateCreatorRow;

                    this.data.push(this.productCreatorRow);

                    this.dataSource.setData(this.data);

                    this.GenerateAndSetNavMatrices(false);

                    this.isUnfinishedRowDeletable = true;

                    this.rowAdded.next([this.data[this.data.length - 1], this.data.length - 1])
                }

                // Clear edit data
                this.ResetEdit();

                // Detect changes in DOM
                this.cdref!.detectChanges();

                if (!this.repairMode) {
                    // Move to the next cell and enter edit mode in it
                    let newX = this.MoveNextInTable();
                    if (newX < colPos) {
                        this.isUnfinishedRowDeletable = false;
                    }
                    let nextRowPost = newX < colPos ? rowPos + 1 : rowPos;
                    let nextRow = newX < colPos ? this.data[nextRowPost] : row;
                    // this.HandleGridEnter(nextRow, nextRowPost, this.colDefs[newX].objectKey, newX, inputId);
                    this.mechanicalClick = true;
                    this.kbs.ClickCurrentElement();
                } else {
                    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                    this.repairMode = false;
                }

                // Notify the parent component about the datachange
                this.parentComponent.TableRowDataChanged(tmp, rowPos, col);
            } else {
                // Entering edit mode
                this.Edit(row, rowPos, col);
                this.SelectInputChar(inputId, fInputType ?? '', row, col)
            }

            this.PushFooterCommandList();

            console.log((this.data[rowPos].data as any)[col]);
        } else {
            setTimeout(() => {
                // Already in Edit mode
                if (wasEditActivatedPreviously && !!tmp) {

                    // New blank row if needed
                    if (rowPos === this.data.length - 1 && col === this.colDefs[0].colKey && !tmp.IsUnfinished()) {
                        this.productCreatorRow = this.GenerateCreatorRow;
                        this.data.push(this.productCreatorRow);

                        this.dataSource.setData(this.data);

                        this.GenerateAndSetNavMatrices(false);

                        this.isUnfinishedRowDeletable = true;

                        this.rowAdded.next([this.data[this.data.length - 1], this.data.length - 1])
                    }

                    // Clear edit data
                    this.ResetEdit();

                    // Detect changes in DOM
                    this.cdref!.detectChanges();

                    if (!this.repairMode) {
                        const moveCount = this.nextAvailableInDistance(col, row)

                        // Move to the next cell and enter edit mode in it
                        let newX = 1
                        for (let i = 0; i < moveCount; i++) {
                            newX = this.MoveNextInTable();
                        }

                        if (newX < colPos) {
                            this.isUnfinishedRowDeletable = false;
                        }
                        let nextRowPost = newX < colPos ? rowPos + 1 : rowPos;
                        let nextRow = newX < colPos ? this.data[nextRowPost] : row;
                        // this.HandleGridEnter(nextRow, nextRowPost, this.colDefs[newX].objectKey, newX, inputId);
                        this.mechanicalClick = true;
                        this.kbs.ClickCurrentElement();
                    } else {
                        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                        this.repairMode = false;
                    }

                    // Notify the parent component about the datachange
                    this.parentComponent.TableRowDataChanged(tmp, rowPos, col);
                } else {
                    // Entering edit mode
                    this.Edit(row, rowPos, col);
                    this.SelectInputChar(inputId, fInputType ?? '', row, col)
                }

                this.PushFooterCommandList();
            }, 10);
        }

        this.parentComponent.RecalcNetAndVat();

        this.rowModified.next([row, rowPos])
    }

    private nextAvailableInDistance(currentColumn: string, currentRow: TreeGridNode<T>): number {
        const availableColumns = this.allColumns.filter(x => !this.colsToIgnore.includes(x))
        const currentIndex = availableColumns.indexOf(currentColumn)

        let step = 0
        let distance = 1

        do {
            step++
            const columnDefinition = this.colDefs.find(x => x.colKey === availableColumns[currentIndex + step])

            if (!columnDefinition) {
                break
            }

            if (columnDefinition.checkIfReadonly !== undefined) {
                if (columnDefinition.checkIfReadonly(currentRow)) {
                    distance++
                }
            }
            else {
                break
            }
        } while (true)

        return distance
    }

    private SelectInputChar(inputId: string, fInputType: string, row: any, col: any): void {
        this.cdref!.detectChanges();
        $('#' + inputId).trigger('focus');

        if (FORMATTED_NUMBER_COL_TYPES.includes(fInputType ?? '')) {
            const _input = document.getElementById(inputId) as HTMLInputElement;
            if (!!_input && _input.type === "text") {
                window.setTimeout(function () {
                    const txtVal = $(_input).val() + '';
                    if (!!txtVal) {
                        const l = txtVal.split('.')[0].length;
                        _input.setSelectionRange(0, l);
                    } else {
                        _input.setSelectionRange(0, 1);
                    }
                }, 0);
            }
        } else {
            const _input = document.getElementById(inputId) as HTMLInputElement;
            if (!!_input && _input.type === "text") {
                window.setTimeout(function () {
                    const txtVal = ((row.data as any)[col] as string);
                    if (!!txtVal) {
                        _input.setSelectionRange(txtVal.length, txtVal.length);
                    } else {
                        _input.setSelectionRange(0, 0);
                    }
                }, 0);
            }
        }
    }

    private ApplyGridEnterEffects(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string): void {
        // Switch between nav and edit mode
        let wasEditActivatedPreviously = this.kbS.isEditModeActivated;

        // Already in Edit mode
        if (!!this.editedRow) {
            const tmp = this.editedRow.data;

            // Creator row edited
            if (rowPos === this.data.length - 1 && col === this.colDefs[0].colKey && !this.editedRow.data.IsUnfinished()) {
                this.productCreatorRow = this.GenerateCreatorRow;
                this.data.push(this.productCreatorRow);

                this.dataSource.setData(this.data);

                this.GenerateAndSetNavMatrices(false);

                this.isUnfinishedRowDeletable = true;

                this.rowAdded.next([this.data[this.data.length - 1], this.data.length - 1])
            }

            // this.kbS.toggleEdit();
            this.ResetEdit();
            this.cdref!.detectChanges();

            let newX = this.MoveNextInTable();
            if (wasEditActivatedPreviously) {
                if (newX < colPos) {
                    this.isUnfinishedRowDeletable = false;
                }
                let nextRowPost = newX < colPos ? rowPos + 1 : rowPos;
                let nextRow = newX < colPos ? this.data[nextRowPost] : row;
                this.HandleGridEnter(nextRow, nextRowPost, this.colDefs[newX].objectKey, newX, inputId);
            }

            this.parentComponent.TableRowDataChanged(tmp, rowPos, col);
        } else {
            // Entering edit mode
            this.Edit(row, rowPos, col);
            this.cdref!.detectChanges();
            $('#' + inputId).trigger('focus');

            if (FORMATTED_NUMBER_COL_TYPES.includes(fInputType ?? '')) {
                const _input = document.getElementById(inputId) as HTMLInputElement;
                if (!!_input && _input.type === "text") {
                    window.setTimeout(function () {
                        const txtVal = $(_input).val() + '';
                        if (!!txtVal) {
                            const l = txtVal.split('.')[0].length;
                            _input.setSelectionRange(0, l);
                        } else {
                            _input.setSelectionRange(0, 1);
                        }
                    }, 0);
                }
            } else {
                const _input = document.getElementById(inputId) as HTMLInputElement;
                if (!!_input && _input.type === "text") {
                    window.setTimeout(function () {
                        const txtVal = ((row.data as any)[col] as string);
                        if (!!txtVal) {
                            _input.setSelectionRange(txtVal.length, txtVal.length);
                        } else {
                            _input.setSelectionRange(0, 0);
                        }
                    }, 0);
                }
            }
        }

        this.PushFooterCommandList();
    }

    HandleGridEnter1(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number, inputId: string, fInputType?: string): void {
        if (environment.inlineEditableTableKeyboardDebug) {
            console.log('[HandleGridEnter]: colpos:', colPos, 'maximum colpos: ', this.Matrix[0].length - 1, row, this.editedRow, rowPos, col, inputId, fInputType, row.data.IsUnfinished());
        }

        if (this.kbS.isEditModeActivated) {
            this.kbs.setEditMode(KeyboardModes.NAVIGATION);
            this.ApplyGridEnterEffects(row, rowPos, col, colPos, inputId, fInputType);
        } else {
            this.kbs.setEditMode(KeyboardModes.EDIT);
            setTimeout(() => {
                this.ApplyGridEnterEffects(row, rowPos, col, colPos, inputId, fInputType);
            }, 10);
        }

        this.parentComponent.RecalcNetAndVat();
    }

    CanDelete(): boolean {
        return this.data.length > 1
    }

    HandleGridDelete(event: Event, row: TreeGridNode<T>, rowPos: number, col: string): void {
        if (this.CanDelete() && rowPos !== this.data.length - 1 && !this.kbS.isEditModeActivated) {
            this.data.splice(rowPos, 1);
            this.dataSource.setData(this.data);

            if (rowPos !== 0) {
                this.kbS.MoveUp();
            }
            this.GenerateAndSetNavMatrices(false);

            this.rowDeleted.next([row, this.data.length - 1])
        }

        this.parentComponent.RecalcNetAndVat();
    }

    RemoveEditRow(reGenerateMatrix: boolean = true): void {
        if (!this.data[this.data.length - 1].data.IsUnfinished()) {
            return;
        }

        this.ResetEdit();

        this.data.splice(this.data.length - 1, 1);
        this.dataSource.setData(this.data);

        if ((this.data.length - 1) !== 0) {
            this.kbS.MoveUp();
        }

        if (reGenerateMatrix) {
            this.GenerateAndSetNavMatrices(false);
        }
    }

    isEditingCell(rowIndex: number, col: string): boolean {
        return this.kbS.currentKeyboardMode !== KeyboardModes.NAVIGATION && !!this.editedRow && this.editedRowPos == rowIndex && this.editedProperty == col;
    }

    ClearEdit(): void {
        this.editedRow = undefined;
        this.editedProperty = undefined;
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }

    MoveNextInTable(): number {
        let moveRes = this.kbS.MoveRight(true, false, false);
        if (!moveRes.moved) {
            moveRes = this.kbS.MoveDown(true, false, false);
            this.kbS.p.x = 0;
            this.kbS.SelectCurrentElement();
            // code-fields
            // TODO: refactor
            setTimeout(() => {
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                this.kbs.ClickCurrentElement();
            }, 50);
            return this.kbS.p.x;
        }
        return this.kbS.p.x;
    }
}
