import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, MoveRes } from "src/app/services/keyboard-navigation.service";
import { Constants } from "src/assets/util/Constants";
import { KeyBindings, OfferEditorKeySettings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { IInlineManager } from "../IInlineManager";
import { BlankComboBoxValue } from "./Nav";
import { INavigatable, AttachDirection, TileCssClass, NavigatableType } from "./Navigatable";
import { HelperFunctions } from "src/assets/util/HelperFunctions";

export class InlineTableNavigatableForm implements INavigatable {
    Matrix: string[][] = [[]];

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
    kbS: KeyboardNavigationService;
    cdref: ChangeDetectorRef;

    _data: any[];

    attachDirection: AttachDirection;

    formId: string;

    parentComponent: IInlineManager;

    public KeySetting: Constants.KeySettingsDct = OfferEditorKeySettings;

    constructor(
        f: FormGroup,
        kbs: KeyboardNavigationService,
        cdr: ChangeDetectorRef,
        data: any[],
        formId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        parentComponent: IInlineManager
    ) {
        this.form = f;
        this.kbS = kbs;
        this.cdref = cdr;
        this._data = data;
        this.attachDirection = attachDirection;
        this.formId = formId;
        this.parentComponent = parentComponent;
    }

    Setup(data: any[]): void {
        this._data = data;
    }

    GetValue(formFieldName: string): any {
        return this.form.controls[formFieldName].value;
    }

    SetValue(formFieldName: string, value: any): any {
        return this.form.controls[formFieldName].setValue(value)
    }

    HandleFormEscape(): void {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.cdref.detectChanges();
    }

    FillForm(data: any, skip: string[] = [], mapping: { from: string, to: string }[] = [] ) {
        if (!!data) {
            Object.keys(this.form.controls).forEach((x: string) => {
                if (!skip.includes(x)) {
                    this.form.controls[x].setValue(data[x]);
                }
            });
            mapping.forEach(x => {
                this.form.controls[x.to].setValue(data[x.from]);
            })
        }
    }

    FillFormAfterValueSelect(selectedValue: string, objectKey: string) {
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
            this.kbS.ClickCurrentElement(true);
            if (!this.kbS.isEditModeActivated) {
                this.kbS.toggleEdit();
            }
        } else {
            // For example in case if we just moved onto a confirmation button in the next nav-matrix,
            // we don't want to automatically press it until the user directly presses enter after selecting it.
            if ($('#' + this.kbS.Here).is('td')) {
                if (HelperFunctions.IsEmptyEditableTable(this.kbS.GetCurrentNavigatable)) {
                    this.kbS.ClickCurrentElement(true);
                    this.kbS.setEditMode(KeyboardModes.EDIT);
                }
            }
            if ($('#' + this.kbS.Here).is(':input')) {
                this.kbS.ClickCurrentElement(true);
                this.kbS.setEditMode(KeyboardModes.EDIT);
            }
            else if (!!event) {
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
            this.FillFormAfterValueSelect(event, key);
        }
        if (!this.kbS.isEditModeActivated) {
            this.JumpToNextInput(event);
        }
    }

    HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true, preventEventInAnyCase: boolean = false): void {
        if (preventEventInAnyCase) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }
        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpNext) {
            this.JumpToNextInput(event);
        }
    }

    HandleFormShiftEnter(event: Event, jumpPrevious: boolean = true, toggleEditMode: boolean = true, preventEventInAnyCase: boolean = false): void {
        if (environment.inlineEditableTableNavigatableFormLog) {
            console.log('[HandleFormShiftEnter]: ', event, jumpPrevious, toggleEditMode, preventEventInAnyCase);
        }

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

    private MovePrevious(): MoveRes {
        let moveRes = this.kbS.MoveRight(true, false, false);
        if (!moveRes.moved) {
            moveRes = this.kbS.MoveUp(true, false, true);
        }
        return moveRes;
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
        setTimeout(() => {
            if (environment.inlineEditableTableNavigatableFormLog) {
                console.log("itemCount: " + itemCount, typedValue, event.target, (event.target as any).getAttribute("aria-activedescendant"));
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
                    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                    this.JumpToNextInput(event);
                }
            }
        }, 0);
    }

    HandleKeyNoCrud(event: any, controlKey: string): void {
        switch (event.key) {
            case KeyBindings.F2: {
                event.preventDefault();
                this.parentComponent.ChooseDataForCustomerForm();
                break;
            }
            default: { }
        }
    }

    HandleFilterInputFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true, data: any, formControlName: string): void {
        if (!!data) {
            this.form.controls[formControlName].setValue(data);
        }

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
        if (environment.inlineEditableTableNavigatableFormLog) {
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

    HandleFormFieldClick(event: any): void {
        this.kbS.SetCurrentNavigatable(this);
        this.kbS.setEditMode(KeyboardModes.EDIT);
        this.kbS.SetPositionById(event.target?.id);
    }

    /**
     * Navigational matrix generation
     * @param attach 
     * @param stayAtSamePoseAfterGenerate 
     * @param includeDisabledMiscControls Include by default disabled buttons, eg. search buttons, radiobuttons...
     */
    GenerateAndSetNavMatrices(attach: boolean, stayAtSamePoseAfterGenerate: boolean = false, includeDisabledMiscControls: boolean = false): void {
        // Get tiles
        const tiles = $('.' + TileCssClass, '#' + this.formId);

        if (environment.inlineEditableTableNavigatableFormLog) {
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

            const isDisabled = next.attributes.getNamedItem('disabled')
            const isMiscControl = $(next).is(':button') || $(next).is(':radio')
            if ((isDisabled && isMiscControl && !includeDisabledMiscControls) || (isDisabled && !isMiscControl)) {
                continue
            }

            if (environment.inlineEditableTableNavigatableFormLog) {
                this.LogMatrixGenerationCycle(
                    TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
                );
            }

            // Usually all form elements are in a nb-form-field
            // So we must examine the parent of that element to be sure two form element
            // is not in the same block
            if (currentParent !== '' && !(previous !== '' && $('#' + previous).hasClass('MULTICOLNAVIGATION_DISABLED'))) { // TileCssColClass
                this.Matrix.push([]);
                ++currentMatrixIndex;
            }
            currentParent = next.parentElement!.nodeName;

            next.id = TileCssClass + this.formId + '-' + Math.floor(Date.now() * Math.random());

            $('#' + next.id).off('click');
            $('#' + next.id).on('click', (event) => {
                this.HandleFormFieldClick(event);
            });

            this.Matrix[currentMatrixIndex].push(next.id);
            previous = next.id;
        }

        if (environment.inlineEditableTableNavigatableFormLog) {
            console.log('[GenerateAndSetNavMatrices]', this.Matrix);
        }

        if (stayAtSamePoseAfterGenerate) {
            this.kbS.SelectElementByCoordinate(this.kbS.p.x, this.kbS.p.y);
        }

        if (attach) {
            this.kbS.Attach(this, this.attachDirection);
        }
    }

    Attach(): void {
        this.kbS.Attach(this, this.attachDirection);
    }

    Detach(): void { }

    CanShowFormErrors(formControlName: string): boolean {
        return this.form && this.form.controls[formControlName].invalid && (this.form.controls[formControlName].dirty || this.form.controls[formControlName].touched);
    }

    IsErrorApparent(formControlName: string, validationName: string): boolean {
        return this.form.controls[formControlName].errors?.[validationName]; // eg. 'required'
    }
}