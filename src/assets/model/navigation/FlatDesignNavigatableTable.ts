import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from "@nebular/theme";
import { BbxSidebarService } from "src/app/services/bbx-sidebar.service";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService } from "src/app/services/side-bar-form.service";
import { Constants } from "src/assets/util/Constants";
import { Actions, DefaultKeySettings, KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { SimplePaginator } from "../SimplePaginator";
import { TreeGridNode } from "../TreeGridNode";
import { IUpdatable, IUpdater, IUpdateRequest } from "../UpdaterInterfaces";
import { FlatDesignNavigatableForm } from "./FlatDesignNavigatableForm";
import { INavigatable, AttachDirection, TileCssClass, JumpDestination } from "./Navigatable";

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

    DestWhenJumpedOnto = JumpDestination.UPPER_LEFT;

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

    commandsOnTable: FooterCommandInfo[] = [
        { key: 'Tab', value: '', disabled: false },
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: '', disabled: false },
        { key: 'F3', value: '', disabled: false },
        { key: 'F4', value: '', disabled: false },
        { key: 'F5', value: 'Frissítés', disabled: false },
        { key: 'F6', value: '', disabled: false },
        { key: 'F7', value: '', disabled: false },
        { key: 'F8', value: 'Új', disabled: false },
        { key: 'F9', value: '', disabled: false },
        { key: 'F10', value: '', disabled: false },
        { key: 'F11', value: '', disabled: false },
        { key: 'F12', value: 'Tétellap', disabled: false }
    ];
    commandsOnTableEditMode: FooterCommandInfo[] = this.commandsOnTable;

    private prevSelectedRow?: TreeGridNode<T>;
    private prevSelectedRowPos?: number;
    private prevSelectedCol?: string;
    private prevSelectedColPos?: number;
    private formAttachDirection: AttachDirection = AttachDirection.RIGHT;

    private tag: string = '';

    getBlankInstance: () => T;
    get GenerateCreatorRow(): TreeGridNode<T> {
        return {
            data: this.getBlankInstance()
        };
    }

    public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

    public ReadonlyPredicator: (x: T) => boolean = (x: T) => { return false; }
    public ReadonlySideForm: boolean = false;
    public get ReadonlyForm(): boolean {
        return this.ReadonlySideForm || this.ReadonlyPredicator(this.flatDesignForm.DataToEdit?.data);
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
        getBlankInstance: () => T,
        private includeSearchInNavigationMatrix: boolean = true,
        colDefs: ModelFieldDescriptor[] = []
    ) {
        super();

        this.formAttachDirection = formAttachDirection;

        this._data = data;
        this.attachDirection = attachDirection;
        this.tableId = tableId;

        this.data = [];
        this.dataSource = this.dataSourceBuilder.create(this.data);
        this.allColumns = [];
        this.colDefs = colDefs;
        this.colsToIgnore = [];

        this.flatDesignForm = new FlatDesignNavigatableForm(
            f, this.kbs, this.cdr, data, formId, formAttachDirection, this.colDefs, this.sidebarService, this.sidebarFormService, this, this.fS
        );

        this.tag = tag;

        this.getBlankInstance = getBlankInstance;
        
        this.kbs.NavigatableChanged.subscribe({
            next: (newNav: string) => {
                if (newNav !== this.flatDesignForm.constructor.name) {
                    this.ReadonlySideForm = true;
                    this.sidebarFormService.SetCurrentForm([this.tag, { form: this.flatDesignForm, readonly: this.ReadonlyForm }]);
                }
            }
        });
    }

    Lock(data?: IUpdateRequest): void {
        this.updater.ActionLock(data);
        this.PushFooterCommandList();
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

    Refresh(): void {
        this.updater.ActionRefresh();
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
    Detach(): void {
        this.kbs.Detach();
    }

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

        let includeFilterY = 0;
        if (this.includeSearchInNavigationMatrix) {
            includeFilterY = 1;
            this.kbs.ElementIdSelected.subscribe(id => {
                if (this.Matrix[0].includes(id)) {
                    this.SetBlankInstanceForForm(false, false);
                }
            });
        }

        if (this.kbs.p.y >= (this.data.length + includeFilterY)) {
            if (this.data.length > 0) {
                this.kbs.SelectElementByCoordinate(0, 1);
            } else {
                this.kbs.SelectElementByCoordinate(0, 0);
            }
        }
    }

    SetBlankRowGenerator(getBlankInstance: () => T): void {
        this.getBlankInstance = getBlankInstance;
    }

    PushFooterCommandList(): void {}

    SelectRowById(id: any): void {
        const rowIndex = this.data.findIndex(x => (x.data as any).id === id);
        if (environment.flatDesignTableDebug) {
            console.log(rowIndex);
        }
        if (rowIndex !== -1) {
            const filterValue = this.includeSearchInNavigationMatrix ? 1 : 0;
            this.HandleGridClick(this.data[rowIndex], rowIndex, this.colDefs[0].objectKey, 0);
        }
    }

    HandleGridEscape(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        this.kbs.setEditMode(KeyboardModes.NAVIGATION);
        this.cdr!.detectChanges();
        this.kbs.SelectCurrentElement();
        this.PushFooterCommandList();
    }

    SetBlankInstanceForForm(openSideBar: boolean, jump: boolean = true): void {
        console.log("SetBlankInstanceForForm");
        
        const creatorRow = this.GenerateCreatorRow;

        if (environment.flatDesignTableDebug) {
            console.log(`Blank instance: ${creatorRow}`);
        }

        this.prevSelectedRow = creatorRow;
        this.prevSelectedRowPos = -1;
        this.prevSelectedCol = '';
        this.prevSelectedColPos = -1;

        this.flatDesignForm.SetDataForEdit(creatorRow, -1, '');
        this.sidebarFormService.SetCurrentForm([this.tag, { form: this.flatDesignForm, readonly: this.ReadonlyForm }]);
        
        this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
        this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;
        
        this.flatDesignForm.SetClean();

        this.flatDesignForm.SetFormStateToNew();
        
        if (openSideBar) {
            this.sidebarService.expand();
        }
    }

    SetAsNeighbour(direction: AttachDirection, navigatable: INavigatable): void {
        switch(direction) {
            case AttachDirection.DOWN:
                this.DownNeighbour = navigatable;
                navigatable.UpNeighbour = this;
                break;
            case AttachDirection.LEFT:
                this.LeftNeighbour = navigatable;
                navigatable.RightNeighbour = this;
                break;
            case AttachDirection.UP:
                this.UpNeighbour = navigatable;
                navigatable.DownNeighbour = this;
                break;
            case AttachDirection.RIGHT:
                this.RightNeighbour = navigatable;
                navigatable.LeftNeighbour = this;
                break;
        }
    }

    HandleGridClick(row: TreeGridNode<T>, rowPos: number, col: string, colPos: number): void {
        this.kbs.setEditMode(KeyboardModes.NAVIGATION);

        if (environment.flatDesignTableDebug) {
            console.log('[HandleGridClick]');
        }

        if (this.includeSearchInNavigationMatrix) {
            ++rowPos;
        }

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
        this.sidebarFormService.SetCurrentForm([this.tag, { form: this.flatDesignForm, readonly: this.ReadonlyForm }]);

        this.flatDesignForm.PreviousXOnGrid = this.kbs.p.x;
        this.flatDesignForm.PreviousYOnGrid = this.kbs.p.y;

        this.flatDesignForm.GenerateAndSetNavMatrices(false, false);
        this.SetAsNeighbour(this.formAttachDirection, this.flatDesignForm);
    }

    private LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
        if (environment.flatDesignTableDebug) {
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

    GenerateAndSetNavMatrices(attach: boolean, idToSelectAfterGenerate?: any, selectPreviousPoseAfterGenerate: boolean = false): void {
        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.tableId);

        // if (environment.flatDesignTableDebug) {
        //     console.log('[GenerateAndSetNavMatrices] Data: ', this.data);
        //     console.log('[GenerateAndSetNavMatrices]', 'Tiles: ', tiles, 'Css class: ', '.' + TileCssClass, '#TableID: ', '#' + this.tableId);
        // }

        let currentParent!: HTMLElement;

        // Prepare matrix
        this.Matrix = [[]];
        let currentMatrixIndex = 0;

        if (this.includeSearchInNavigationMatrix) {
            this.Matrix = [['active-prod-search', 'active-prod-search-clear']];
            this.Matrix.push([]);
            ++currentMatrixIndex;
        }

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

        if (environment.flatDesignTableDebug) {
            console.log('[GenerateAndSetNavMatrices]', this.Matrix);
        }

        if (attach) {
            this.kbs.Attach(this, this.attachDirection);
        }

        if (selectPreviousPoseAfterGenerate) {
            const tempX = this.kbs.p.x;
            const tempY = this.kbs.p.y;

            if (environment.flatDesignTableDebug) {
                console.log('selectPreviousPoseAfterGenerate: ', this.Matrix, tempX, tempY, this.kbs.IsCurrentNavigatable(this));
            }

            this.cdr.detectChanges();

            this.kbs.SelectElementByCoordinate(tempX, tempY);

            if (environment.flatDesignTableDebug) {
                console.log(this.kbs.Here, this.Matrix[2].includes(this.kbs.Here));
            }
        }

        if (idToSelectAfterGenerate !== undefined) {
            this.SelectRowById(idToSelectAfterGenerate);
        }

        // this.kbs.LogMatrix();
    }

    HandleSearchFieldTab(): void {
        if (this.sidebarService.sideBarOpened) {
            this.JumpToFirstFormField();
        }
    }

    /**
     * Formban található adatok beállítása létrehozás és szerkesztéshez
     * @param row 
     * @param openSideBar 
     * @param jump 
     */
    SetDataForForm(row: TreeGridNode<T>, openSideBar: boolean, jump: boolean = true): void {
        if (environment.flatDesignTableDebug) {
            console.log(`Data: ${row}`);
        }

        this.prevSelectedRow = row;

        this.flatDesignForm.SetDataForEdit(row, this.prevSelectedRowPos!, this.prevSelectedCol!);
        this.sidebarFormService.SetCurrentForm([this.tag, { form: this.flatDesignForm, readonly: this.ReadonlyForm }]);

        this.flatDesignForm.SetClean();

        setTimeout(() => {
            if (openSideBar) {
                this.sidebarService.expand();
            }

            this.flatDesignForm.GenerateAndSetNavMatrices(false, true);
            this.SetAsNeighbour(this.formAttachDirection, this.flatDesignForm);

            if (jump) {
                this.kbs.Jump(this.flatDesignForm.attachDirection, true);
            }

            this.flatDesignForm.PushFooterCommandList();
        }, 200);
    }

    /**
     * Formban található adatok beállítása kifejezetten readonly formhoz
     * @param row 
     * @param openSideBar 
     * @param jump 
     */
    SetDataForReadonlyForm(row: TreeGridNode<T>, openSideBar: boolean): void {
        if (environment.flatDesignTableDebug) {
            console.log(`Data: ${row}`);
        }

        this.prevSelectedRow = row;

        this.flatDesignForm.SetDataForEdit(row, this.prevSelectedRowPos!, this.prevSelectedCol!);
        this.sidebarFormService.SetCurrentForm([this.tag, { form: this.flatDesignForm, readonly: this.ReadonlyForm }]);

        this.flatDesignForm.SetClean();

        setTimeout(() => {
            if (openSideBar) {
                this.sidebarService.expand();
            }

            this.flatDesignForm.GenerateAndSetNavMatrices(false, true);
            this.SetAsNeighbour(this.formAttachDirection, this.flatDesignForm);

            this.flatDesignForm.PushFooterCommandList();
        }, 200);
    }

    /**
     * Open sidebarform for readonly
     * @param setFormForNew 
     * @returns 
     */
    private HandleToggleSideBarForm(setFormForNew: boolean = false): void {
        if (this.ReadonlyForm &&
            (!this.sidebarService.sideBarOpened && (this.data.length === 0 || !this.kbs.IsCurrentNavigatable(this) || !!!this.flatDesignForm.DataToEdit))) {
            return;
        }
        if (!this.sidebarService.sideBarOpened) {
            this.flatDesignForm.PushFooterCommandList();
        } else {
            this.PushFooterCommandList();
        }
        // console.log(!this.sidebarService.sideBarOpened, this.data.length === 0, !this.kbs.IsCurrentNavigatable(this), !!!this.flatDesignForm.DataToEdit);
        if (!this.sidebarService.sideBarOpened && (this.data.length === 0 || !this.kbs.IsCurrentNavigatable(this) || !!!this.flatDesignForm.DataToEdit)) {
            this.SetBlankInstanceForForm(true);
        } else if (!this.sidebarService.sideBarOpened) {
            this.SetDataForReadonlyForm(this.editedRow!, true);
        } else {
            this.sidebarService.collapse();
        }
    }

    private HandleEditAndNew(setFormForNew: boolean = false): void {
        if (this.ReadonlyForm &&
            (!this.sidebarService.sideBarOpened && (this.data.length === 0 || !this.kbs.IsCurrentNavigatable(this) || !!!this.flatDesignForm.DataToEdit))) {
            return;
        }
        // Új elem létrehozása
        if (setFormForNew) {
            this.SetBlankInstanceForForm(!this.sidebarService.sideBarOpened);
        // Szerkesztés
        } else {
            if (!this.sidebarService.sideBarOpened) {
                this.flatDesignForm.PushFooterCommandList();
            } else {
                this.PushFooterCommandList();
            }
            if (!this.sidebarService.sideBarOpened && (this.data.length === 0 || !this.kbs.IsCurrentNavigatable(this) || !!!this.flatDesignForm.DataToEdit)) {
                this.SetBlankInstanceForForm(true);
            } else if (!this.sidebarService.sideBarOpened) {
                this.SetDataForForm(this.editedRow!, true);
            }
        }
    }

    HandleKey(event: any): void {
        switch (event.key) {
            case this.KeySetting[Actions.ToggleForm].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.ToggleForm].FunctionLabel}, ${Actions[Actions.ToggleForm]}`);
                event.preventDefault();
                this.ReadonlySideForm = true;
                this.HandleToggleSideBarForm(true);
                break;
            }
            case this.KeySetting[Actions.Refresh].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.Refresh].FunctionLabel}, ${Actions[Actions.Refresh]}`);
                event.preventDefault();
                this.Refresh();
                break;
            }
            case this.KeySetting[Actions.Create].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.Create].FunctionLabel}, ${Actions[Actions.Create]}`);
                event.preventDefault();
                this.ReadonlySideForm = false;
                this.HandleEditAndNew(true);
                this.JumpToFirstFormField();
                break;
            }
            case this.KeySetting[Actions.Edit].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.Edit].FunctionLabel}, ${Actions[Actions.Edit]}`);
                event.preventDefault();
                this.ReadonlySideForm = false;
                this.HandleEditAndNew(false);
                this.JumpToFirstFormField();
                break;
            }
            case this.KeySetting[Actions.Delete].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.Delete].FunctionLabel}, ${Actions[Actions.Delete]}`);
                if (!!this.prevSelectedRow && this.flatDesignForm.formMode === Constants.FormState.default && this.sidebarService.sideBarOpened) {
                    event.preventDefault();
                    this.Delete({ needConfirmation: true, data: this.prevSelectedRow.data, rowIndex: this.prevSelectedRowPos } as IUpdateRequest);
                    this.JumpToFirstFormField();
                }
                break;
            }
            case this.KeySetting[Actions.Lock].KeyCode: {
                console.log(`FlatDesignNavigatableTable - HandleKey - ${this.KeySetting[Actions.Lock].FunctionLabel}, ${Actions[Actions.Lock]}`);
                if (!!this.prevSelectedRow) {
                    event.preventDefault();
                    this.Lock({ needConfirmation: true, data: this.prevSelectedRow.data, rowIndex: this.prevSelectedRowPos } as IUpdateRequest);
                    this.JumpToFirstFormField();
                }
                break;
            }
            default: { }
        }
    }

    JumpToFirstFormField(): void {
        if (this.ReadonlyForm) {
            return;
        }
        if (this.sidebarService.sideBarOpened) {
            this.kbs.Jump(this.flatDesignForm.attachDirection, true);
            this.kbs.setEditMode(KeyboardModes.NAVIGATION);
            this.kbs.MoveUp();
            this.kbs.setEditMode(KeyboardModes.EDIT);
        }
    }

    JumpToFlatDesignForm(tabKeyDownEvent?: Event, row?: TreeGridNode<T>, rowPos?: number, col?: string, colPos?: number): void {
        if (this.ReadonlyForm) {
            return;
        }
        tabKeyDownEvent?.preventDefault();
        tabKeyDownEvent?.stopImmediatePropagation();
        tabKeyDownEvent?.stopPropagation();
        
        if (row !== undefined && rowPos !== undefined && col !== undefined && colPos !== undefined) {
            this.HandleGridClick(row, rowPos, col, colPos);
        }
        
        this.kbs.Jump(this.flatDesignForm.attachDirection, true);
        this.flatDesignForm.PushFooterCommandList();
    }

    JumpToFlatDesignFormByForm(formInputId: string): void {
        if (this.ReadonlyForm) {
            return;
        }
        this.kbs.Jump(this.flatDesignForm.attachDirection, true);
        this.flatDesignForm.PushFooterCommandList();
        this.kbs.SetPositionById(formInputId);
    }
}