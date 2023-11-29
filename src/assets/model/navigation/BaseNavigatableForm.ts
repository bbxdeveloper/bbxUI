import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, MoveRes, JumpPosPriority } from "src/app/services/keyboard-navigation.service";
import { Constants } from "src/assets/util/Constants";
import { KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { TreeGridNode } from "../TreeGridNode";
import { IUpdater, IUpdateRequest } from "../UpdaterInterfaces";
import { IFunctionHandler } from "./IFunctionHandler";
import { BlankComboBoxValue } from "./Nav";
import { INavigatable, AttachDirection, TileCssClass, TileCssColClass, JumpDestination, NavigatableType } from "./Navigatable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class BaseNavigatableForm<T = any> implements IFunctionHandler, INavigatable, IUpdater<T> {
    Matrix: string[][] = [[]];

    IsMultiColMatrixGenEnabled: boolean = false
    JumpPosPriority: JumpPosPriority = JumpPosPriority.first

    NavigatableType = NavigatableType.form

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

    PreviousXOnGrid: number = -1;
    PreviousYOnGrid: number = -1;

    DataToEdit?: TreeGridNode<any>;

    readonly commandsOnForm: FooterCommandInfo[] = [
        { key: 'Tab', value: '', disabled: false },
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
        { key: 'F12', value: '', disabled: false }
    ];

    _formMode: Constants.FormState = Constants.FormState.default;
    get formMode(): Constants.FormState { return this._formMode; }
    set formMode(val: Constants.FormState) {
        this._formMode = val;
    }


    get isDeleteDisabled() { return this.formMode === Constants.FormState.new; }

    constructor(
        f: FormGroup,
        protected kbS: KeyboardNavigationService,
        protected cdref: ChangeDetectorRef,
        data: any[],
        formId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        protected fS: FooterService
    ) {
        this.form = f;
        this._data = data;
        this.attachDirection = attachDirection;
        this.formId = formId;

        this.SetFormStateToDefault();
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

    IsFormInNewState(): boolean {
        return this.formMode == Constants.FormState.new;
    }

    IsFormInDefaultState(): boolean {
        return this.formMode == Constants.FormState.default;
    }

    ActionExit(data?: IUpdateRequest<T>): void { }
    ActionLock(data?: IUpdateRequest<T>): void { }
    ActionNew(data?: IUpdateRequest<T>): void { }
    ActionReset(data?: IUpdateRequest<T>): void { }
    ActionPut(data?: IUpdateRequest<T>): void { }
    ActionDelete(data?: IUpdateRequest<T>): void { }
    ActionRefresh(data?: IUpdateRequest<T>): void { }

    HandleFormFocusOut(): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }

    HandleFunctionKey(event: Event | KeyBindings): void { }

    HandleFormEscape(): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.cdref.detectChanges();
    }

    HandleFormClick(): void {
        this.PushFooterCommandList();
    }

    HandleFormFieldClick(event: any): void {
        this.kbS.setEditMode(KeyboardModes.EDIT);
        this.kbS.SetPositionById(event.target?.id);
    }

    public SetDataForEdit(row: TreeGridNode<any>, rowPos: number, objectKey: string): void {
        if (environment.flatDesignFormDebug) {
            console.log("[SetDataForEdit] Form: ", this.form, ", row: ", row); // TODO: only for debug
        }
        this.DataToEdit = row;
        this.FillFormWithObject(this.DataToEdit?.data);
        this.SetFormStateToDefault();
    }

    FillObjectWithForm: () => T = () => {
        const data = {} as T;
        Object.keys(this.form.controls).forEach((x: string) => {
            data[x as keyof T] = this.form.controls[x].value;
            this.form.controls[x].markAsTouched();
            if (environment.flatDesignFormDebug) {
                console.log('FormField value: ', this.form.controls[x].value, 'Data field value: ', data[x as keyof T]);
            }
        });
        if (environment.flatDesignFormDebug) {
            console.log("Data from form: ", data);
        }
        return data as T;
    }

    public FillFormWithObject(data: any, setValueOptions?: any): void {
        if (!data) {
            return
        }

        Object.keys(this.form.controls).forEach((x: string) => {
            this.form.controls[x].setValue(data[x], setValueOptions)
            if (environment.flatDesignFormDebug) {
                console.log(`[FillFormWithObject] ${x}, ${data[x]}, ${this.form.controls[x].value}`);
            }
        })
    }

    protected MoveNext(): MoveRes {
        let moveRes = this.kbS.MoveRight(true, false, false);

        if (!moveRes.moved) {
            moveRes = this.kbS.NextColumn()
        }

        if (!moveRes.moved) {
            moveRes = this.kbS.MoveDown(true, false, true);
        }

        return moveRes;
    }

    protected MovePrevious(): MoveRes {
        let moveRes = this.kbS.MoveRight(true, false, false);
        if (!moveRes.moved) {
            moveRes = this.kbS.MoveUp(true, false, true);
        }
        return moveRes;
    }

    protected JumpToNextInput(event?: Event): void {
        const moveRes = this.MoveNext();
        // We can't know if we should click the first element if we moved to another navigation-matrix.
        if (!moveRes.jumped) {
            this.kbS.ClickCurrentElement();
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
            this.Detach();
        }
    }

    protected JumpToPreviousInput(event?: Event): void {
        const moveRes = this.MovePrevious();
        // We can't know if we should click the first element if we moved to another navigation-matrix.
        if (!moveRes.jumped) {
            this.kbS.ClickCurrentElement();
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
            this.Detach();
        }
    }

    HandleFormShiftEnter(event: Event, jumpPrevious: boolean = true, toggleEditMode: boolean = true): void {
        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }

        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpPrevious) {
            this.JumpToPreviousInput(event);
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

    HandleAutoCompleteSelect(event: any, key: string): void {
        if (environment.flatDesignFormDebug) {
            console.log('[HandleAutoCompleteSelect] ', event);
        }
        // If the table is still the current navigatable and the form is filled
        // this event could be triggered but MUST NOT be handled here because it breaks the flow
        // of navigation.
        if (!this.kbS.IsCurrentNavigatable(this)) {
            return;
        }
        if (!this.kbS.isEditModeActivated) {
            this.JumpToNextInput(event);
        }
    }

    AutoCorrectSelectCaseInsensitive(event: Event, itemCount: number, possibleItems?: string[], typedValue?: string, preventEvent = false, lastFormField: boolean = false, formFieldName?: string): boolean {
        const ad = (event.target as any).getAttribute("aria-activedescendant");
        if (this.kbS.isEditModeActivated &&
            ad === null &&
            possibleItems !== undefined && typedValue !== undefined &&
            (!possibleItems.includes(typedValue) && typedValue !== BlankComboBoxValue)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            if (HelperFunctions.isEmptyOrSpaces(formFieldName)) {
                return false
            }

            const caseInsensitiveMatch = possibleItems.find(x => x.toLowerCase() === (event as any).target.value.trim().toLowerCase())
            if (!HelperFunctions.isEmptyOrSpaces(caseInsensitiveMatch)) {
                this.form.controls[formFieldName!].setValue(caseInsensitiveMatch)
                return true
            } else {
                return false
            }
        }
        return true
    }

    HandleFormDropdownEnter(event: Event, itemCount: number, possibleItems?: string[], typedValue?: string, preventEvent = false, lastFormField: boolean = false, formFieldName?: string): void {
        if (environment.flatDesignFormDebug) {
            console.log("itemCount: " + itemCount, typedValue, event.target, (event.target as any).getAttribute("aria-activedescendant"));
        }

        if (preventEvent) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }

        const ad = (event.target as any).getAttribute("aria-activedescendant");

        if (this.kbS.isEditModeActivated &&
            ad === null &&
            possibleItems !== undefined && typedValue !== undefined &&
            (!possibleItems.includes(typedValue) && typedValue !== BlankComboBoxValue)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();

            if (HelperFunctions.isEmptyOrSpaces(formFieldName)) {
                return
            }

            const caseInsensitiveMatch = possibleItems.find(x => x.toLowerCase() === (event as any).target.value.trim().toLowerCase())
            if (!HelperFunctions.isEmptyOrSpaces(caseInsensitiveMatch)) {
                this.form.controls[formFieldName!].setValue(caseInsensitiveMatch)
            } else {
                return;
            }
        }

        if (ad !== null && itemCount > 1) {
            this.kbS.toggleEdit();
        } else {
            if (!this.kbS.isEditModeActivated) {
                this.kbS.toggleEdit();
            } else {
                if (lastFormField) {
                    this.HandleFormLastEnter(event);
                } else {
                    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                    this.JumpToNextInput(event);
                }
            }
        }
    }

    HandleFormLastEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        if (!this.kbS.isEditModeActivated) {
            this.HandleFormEnter(event, jumpNext, toggleEditMode);
        } else {
            switch (this.formMode) {
                case Constants.FormState.new:
                    this.ActionNew({ needConfirmation: true } as IUpdateRequest<T>);
                    break;
                case Constants.FormState.default:
                    this.ActionPut({ needConfirmation: true } as IUpdateRequest<T>);
                    break;
            }
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

    HandleKey(event: any): void { }

    PushFooterCommandList(): void {
        this.fS.pushCommands(this.commandsOnForm);
    }

    ClearNeighbours(): void {
        this.LeftNeighbour = undefined;
        this.RightNeighbour = undefined;
        this.DownNeighbour = undefined;
        this.UpNeighbour = undefined;
    }

    protected LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
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

    GenerateAndSetNavMatrices(attach: boolean, setAsCurrentNavigatable: boolean = true): void {
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
            if (currentParent !== '' && !(previous !== '' && (!!this.IsMultiColMatrixGenEnabled && $('#' + previous).hasClass(TileCssColClass)))) {
                this.Matrix.push([]);
                ++currentMatrixIndex;
            }
            currentParent = next.parentElement!.nodeName;

            next.id = TileCssClass + this.formId + '-' + Math.floor(Date.now() * Math.random());
            this.Matrix[currentMatrixIndex].push(next.id);
            previous = next.id;
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

    AfterViewInitSetup(attach: boolean = false): void {
        this.GenerateAndSetNavMatrices(attach, false);

        this.PushFooterCommandList();

        if (this.formMode === Constants.FormState.new) {
            this.kbS.Jump(this.attachDirection, true);
        }
    }
}