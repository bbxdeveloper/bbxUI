import { prepareEventListenerParameters } from "@angular/compiler/src/render3/view/template";
import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BbxSidebarService } from "src/app/services/bbx-sidebar.service";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, MoveRes } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService } from "src/app/services/side-bar-form.service";
import { Constants } from "src/assets/util/Constants";
import { Actions, DefaultKeySettings, KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { IInlineManager } from "../IInlineManager";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { TreeGridNode } from "../TreeGridNode";
import { IUpdater, IUpdateRequest } from "../UpdaterInterfaces";
import { FlatDesignNavigatableTable } from "./FlatDesignNavigatableTable";
import { FlatDesignNoFormNavigatableTable } from "./FlatDesignNoFormNavigatableTable";
import { BlankComboBoxValue } from "./Nav";
import { INavigatable, AttachDirection, TileCssClass, TileCssColClass, NavMatrixOrientation } from "./Navigatable";

export class FlatDesignNoTableNavigatableForm<T = any> implements INavigatable, IUpdater<T> {
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
    DataToEdit?: TreeGridNode<any>;

    readonly commandsOnForm: FooterCommandInfo[] = [
        { key: 'Tab', value: '', disabled: false },
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: '', disabled: false },
        { key: 'F3', value: '', disabled: false },
        { key: 'F4', value: '', disabled: false },
        { key: 'F5', value: 'Táblázat újratöltése', disabled: false },
        { key: 'F6', value: '', disabled: false },
        { key: 'F7', value: '', disabled: false },
        { key: 'F8', value: '', disabled: false },
        { key: 'F9', value: '', disabled: false },
        { key: 'F10', value: '', disabled: false },
        { key: 'F11', value: '', disabled: false },
        { key: 'F12', value: '', disabled: false }
    ];

    formMode: Constants.FormState = Constants.FormState.default;

    get isDeleteDisabled() { return this.formMode === Constants.FormState.new; }

    IsFootersEnabled: boolean = true;

    parentComponent!: IInlineManager;

    public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

    constructor(
        f: FormGroup,
        private kbS: KeyboardNavigationService,
        private cdref: ChangeDetectorRef,
        data: any[],
        formId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        colDefs: ModelFieldDescriptor[],
        private sidebarService: BbxSidebarService,
        private fS: FooterService,
        private grid?: FlatDesignNavigatableTable<T> | FlatDesignNoFormNavigatableTable<T>,
        parentComponent?: IInlineManager
    ) {
        this.form = f;
        this._data = data;
        this.attachDirection = attachDirection;
        this.formId = formId;
        this.colDefs = colDefs;

        if (!!parentComponent) {
            this.parentComponent = parentComponent;
        }

        this.SetFormStateToDefault();

        console.log("[ctor FlatDesignNavigatableForm] Params in order (without services): ", f, data, attachDirection, formId, colDefs); // TODO: only for debug

        this.sidebarService.onCollapse().subscribe({
            next: value => {
                if (!!this.LeftNeighbour || !!this.RightNeighbour || !!this.DownNeighbour || !!this.UpNeighbour) {
                    if (!this.kbS.IsCurrentNavigatable(this)) {
                        this.kbS.SetCurrentNavigatable(this);
                    }
                    this.Detach(this.PreviousXOnGrid, this.PreviousYOnGrid);
                    this.grid?.PushFooterCommandList();
                }
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            },
            complete: () => {
                this.kbS.isEditModeLocked = false;
            }
        });
    }

    FillForm(data: any, skip: string[] = []) {
        if (!!data) {
            Object.keys(this.form.controls).forEach((x: string) => {
                if (!skip.includes(x)) {
                    this.form.controls[x].setValue(data[x]);
                }
            });
        }
    }

    GetValue(formFieldName: string): any {
        return this.form.controls[formFieldName].value;
    }

    CanShowFormErrors(formControlName: string): boolean {
        return this.form.controls[formControlName].invalid && (this.form.controls[formControlName].dirty || this.form.controls[formControlName].touched);
    }

    IsErrorApparent(formControlName: string, validationName: string): boolean {
        return this.form.controls[formControlName].errors?.[validationName]; // eg. 'required'
    }

    SetClean(): void {
        Object.keys(this.form.controls).forEach((x: string) => {
            this.form.controls[x].markAsPristine();
        });
    }

    SetFormStateToDefault(): void {
        this.formMode = Constants.FormState.default;
    }

    SetFormStateToNew(): void {
        this.formMode = Constants.FormState.new;
    }

    ActionLock(data?: IUpdateRequest<T>): void { }

    ActionNew(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        if (this.form.invalid) {
            return;
        }
        this.grid?.New({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: data?.needConfirmation ?? false
        } as IUpdateRequest);
    }

    ActionReset(data?: IUpdateRequest<T>): void {
        this.grid?.Reset({
            rowIndex: this.DataRowIndex,
            needConfirmation: false
        } as IUpdateRequest);
    }

    ActionPut(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        if (this.form.invalid) {
            return;
        }
        this.grid?.Put({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: data?.needConfirmation ?? false
        } as IUpdateRequest);
    }

    ActionDelete(data?: IUpdateRequest<T>): void {
        this.grid?.Delete({
            data: this.DataToEdit?.data,
            rowIndex: this.DataRowIndex,
            needConfirmation: true
        } as IUpdateRequest);
    }

    ActionRefresh(data?: IUpdateRequest<T>): void {
        this.grid?.Refresh();
    }

    HandleFormFocusOut(): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }

    HandleFunctionKey(event: Event | KeyBindings): void {
        const val = event instanceof Event ? (event as KeyboardEvent).code : event;
        switch (val) {
            // NEW
            case this.KeySetting[Actions.CrudNew].KeyCode:
                switch (this.formMode) {
                    case Constants.FormState.new:
                    case Constants.FormState.default:
                    default:
                        this.grid?.SetBlankInstanceForForm(false, false);
                        this.formMode = Constants.FormState.new;
                        break;
                }
                break;
            // RESET
            case this.KeySetting[Actions.CrudReset].KeyCode:
                this.ActionReset();
                break;
            // SAVE
            case this.KeySetting[Actions.CrudSave].KeyCode:
                switch (this.formMode) {
                    case Constants.FormState.new:
                        this.ActionNew();
                        break;
                    case Constants.FormState.default:
                        this.ActionPut();
                        break;
                }
                break;
            // DELETE
            case this.KeySetting[Actions.CrudDelete].KeyCode:
            case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
                switch (this.formMode) {
                    case Constants.FormState.default:
                        this.ActionDelete();
                        break;
                }
                break;
        }
    }

    HandleFormEscape(): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.cdref.detectChanges();
    }

    HandleFormClick(): void {
        this.PushFooterCommandList();
    }

    HandleFormFieldClick(event: any): void {
        if (!!this.grid && !this.kbS.IsCurrentNavigatable(this.grid)) {
            // this.GenerateAndSetNavMatrices(false);
            this.grid.JumpToFlatDesignFormByForm(event.target?.id);
        } else {
            this.kbS.SetCurrentNavigatable(this);
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.SetPositionById(event.target?.id);
        }
    }

    public SetDataForEdit(row: TreeGridNode<any>, rowPos: number, objectKey: string): void {
        if (environment.flatDesignFormDebug) {
            console.log("[SetDataForEdit] Form: ", this.form, ", row: ", row); // TODO: only for debug
        }
        this.DataRowIndex = rowPos;
        this.DataToEdit = row;
        this.FillFormWithObject(this.DataToEdit?.data);
        this.SetFormStateToDefault();
    }

    public FillObjectWithForm(): T {
        const data = {} as T;
        Object.keys(this.form.controls).forEach((x: string) => {
            data[x as keyof T] = this.form.controls[x].value;
            this.form.controls[x].markAsTouched();
            console.log('FormField value: ', this.form.controls[x].value, 'Data field value: ', data[x as keyof T]);
        });
        if (environment.flatDesignFormDebug) {
            console.log("Data from form: ", data);
        }
        return data as T;
    }

    private FillFormWithObject(data: any): void {
        if (!!data) {
            Object.keys(this.form.controls).forEach((x: string) => {
                this.form.controls[x].setValue(data[x]);
                if (environment.flatDesignFormDebug) {
                    console.log(`[FillFormWithObject] ${x}, ${data[x]}, ${this.form.controls[x].value}`);
                }
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

    private MovePrevious(): MoveRes {
        let moveRes = this.kbS.MoveRight(true, false, false);
        if (!moveRes.moved) {
            moveRes = this.kbS.MoveUp(true, false, true);
        }
        return moveRes;
    }

    private JumpToNextInput(event?: Event): void {
        const moveRes = this.MoveNext();
        // We can't know if we should click the first element if we moved to another navigation-matrix.
        if (!moveRes.jumped) {
            this.kbS.ClickCurrentElement(true);
            if (!this.kbS.isEditModeActivated) {
                this.kbS.setEditMode(KeyboardModes.EDIT);
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

    private JumpToPreviousInput(event?: Event): void {
        const moveRes = this.MovePrevious();
        // We can't know if we should click the first element if we moved to another navigation-matrix.
        if (!moveRes.jumped) {
            this.kbS.ClickCurrentElement(true);
            if (!this.kbS.isEditModeActivated) {
                this.kbS.setEditMode(KeyboardModes.EDIT);
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

    HandleFormShiftEnter(event: Event, jumpPrevious: boolean = true, toggleEditMode: boolean = true, preventEventInAnyCase: boolean = false): void {
        console.log('[HandleFormShiftEnter]: ', event, jumpPrevious, toggleEditMode, preventEventInAnyCase);

        if (preventEventInAnyCase) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }

        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpPrevious) {
            this.JumpToPreviousInput(event);
        }
    }

    HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true, preventEventInAnyCase: boolean = false): void {
        console.log('[HandleFormEnter]: ', event, jumpNext, toggleEditMode, preventEventInAnyCase);

        if (this.kbS.IsLocked() || preventEventInAnyCase) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }

        if (this.kbS.IsLocked()) {
            return;
        }

        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }
        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpNext) {
            this.JumpToNextInput(event);
        }
    }

    HandleAutoCompleteSelect(event: any, key: string): void {
        console.log('[HandleAutoCompleteSelect]');
        // If the table is still the current navigatable and the form is filled
        // this event could be triggered but MUST NOT be handled here because it breaks the flow
        // of navigation.
        if (!this.kbS.IsCurrentNavigatable(this)) {
            return;
        }
        console.log(`[HandleAutoCompleteSelect] ${event}`);
        if (!this.kbS.isEditModeActivated) {
            this.JumpToNextInput(event);
        }
    }

    HandleFormDropdownEnter(event: Event, itemCount: number, possibleItems?: string[], typedValue?: string): void {
        console.log("itemCount: " + itemCount, typedValue, event.target, (event.target as any).getAttribute("aria-activedescendant"));

        const ad = (event.target as any).getAttribute("aria-activedescendant");
        if (this.kbS.isEditModeActivated &&
            ad === null &&
            possibleItems !== undefined && typedValue !== undefined &&
            (!possibleItems.includes(typedValue) && typedValue !== BlankComboBoxValue)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
        }

        if (ad !== null && itemCount > 1) {
            this.kbS.toggleEdit();
        } else {
            if (!this.kbS.isEditModeActivated) {
                this.kbS.toggleEdit();
            } else {
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                this.JumpToNextInput(event);
            }
        }
    }

    HandleFormLastEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        switch (this.formMode) {
            case Constants.FormState.new:
                this.ActionNew({ needConfirmation: true } as IUpdateRequest<T>);
                break;
            case Constants.FormState.default:
                this.ActionPut({ needConfirmation: true } as IUpdateRequest<T>);
                break;
        }
    }

    HandleFormTab(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }

        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpNext) {
            this.JumpToNextInput(event);
        }
    }

    HandleKeyNoCrud(event: any, controlKey: string): void {
        switch (event.key) {
            case KeyBindings.F2: {
                event.preventDefault();
                this.parentComponent.ChooseDataForForm();
                break;
            }
            default: { }
        }
    }

    HandleKey(event: any): void {
        switch (event.key) {
            case this.KeySetting[Actions.CrudNew].KeyCode: {
                event.preventDefault();
                event.stopPropagation();
                this.ActionNew();
                break;
            }
            case this.KeySetting[Actions.CrudReset].KeyCode: {
                event.preventDefault();
                event.stopPropagation();
                this.ActionReset();
                break;
            }
            case this.KeySetting[Actions.CrudSave].KeyCode: {
                event.preventDefault();
                event.stopPropagation();
                this.ActionPut();
                break;
            }
            case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
            case this.KeySetting[Actions.CrudDelete].KeyCode: {
                event.preventDefault();
                event.stopPropagation();
                this.ActionDelete();
                break;
            }
            case this.KeySetting[Actions.ToggleForm].KeyCode: {
                event.preventDefault();
                this.kbS.isEditModeLocked = true;
                this.sidebarService.collapse();
                break;
            }
            default: { }
        }
    }

    PushFooterCommandList(): void {
        // if (this.IsFootersEnabled) {
        //     this.fS.pushCommands(this.commandsOnForm);
        // }
    }

    ClearNeighbours(): void {
        this.LeftNeighbour = undefined;
        this.RightNeighbour = undefined;
        this.DownNeighbour = undefined;
        this.UpNeighbour = undefined;
    }

    private LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
        if (!environment.flatDesignFormDebug) {
            return;
        }

        console.log("\n\n+---- MATRIX GEN ----+");
        console.log(`Time: ${Date.now().toLocaleString()}`);

        console.log(`Current node: ${node}`);
        console.log(`Parent: ${parent}`);
        console.log(`Grandparent: ${grandParent}`);

        console.log(`CSS Class: ${cssClass}`);

        console.log(`Total tiles: ${totalTiles}`);

        console.log("+------------------+\n\n");
    }

    GenerateAndSetNavMatrices(attach: boolean, setAsCurrentNavigatable: boolean = true, orientation: NavMatrixOrientation = NavMatrixOrientation.NORMAL): void {
        if (environment.flatDesignFormDebug) {
            console.log("[FlatDesignNavigatableForm] START");
        }

        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.formId);

        if (environment.flatDesignFormDebug) {
            console.log('[GenerateAndSetNavMatrices]', this.formId, tiles, '.' + TileCssClass, '#' + this.formId);
        }

        let currentParent = '';

        // Prepare matrix
        this.Matrix = [[]];
        let currentMatrixIndex = 0;
        let previous: string = '';

        // Getting tiles, rows for navigation matrix
        for (let i = 0; i < tiles.length; i++) {
            const next = tiles[i];

            this.LogMatrixGenerationCycle(
                TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
            );

            // Flat Design forms are always vertical
            switch (orientation) {
                case NavMatrixOrientation.ONLY_HORIZONTAL:
                    break;
                case NavMatrixOrientation.ONLY_VERTICAL:
                    this.Matrix.push([]);
                    ++currentMatrixIndex;
                    break;
                case NavMatrixOrientation.NORMAL:
                default:
                    if (currentParent !== '' && !(previous !== '' && $('#' + previous).hasClass('MULTICOLNAVIGATION_DISABLED'))) { // TileCssColClass
                        this.Matrix.push([]);
                        ++currentMatrixIndex;
                    }
                    break;
            }
            currentParent = next.parentElement!.nodeName;

            next.id = TileCssClass + this.formId + '-' + Math.floor(Date.now() * Math.random());
            this.Matrix[currentMatrixIndex].push(next.id);
            previous = next.id;

            // $('#' + next.id).off('enter');
            // $('#' + next.id).on('enter', (event) => {
            //     event.stopImmediatePropagation();
            // });
        }

        if (environment.flatDesignFormDebug) {
            console.log('[GenerateAndSetNavMatrices]', this.Matrix);
        }

        if (attach) {
            this.kbS.Attach(this, this.attachDirection, setAsCurrentNavigatable);
        }

        if (environment.flatDesignFormDebug) {
            console.log("[FlatDesignNavigatableForm] END");
        }
    }

    Attach(): void {
        this.kbS.Attach(this, this.attachDirection);
    }

    Detach(x?: number, y?: number): void {
        this.kbS.Detach(x, y);
    }

    AfterViewInitSetup(): void {
        this.GenerateAndSetNavMatrices(true, false);

        this.PushFooterCommandList();

        if (this.formMode === Constants.FormState.new) {
            this.kbS.Jump(this.attachDirection, true);
        }
    }
}