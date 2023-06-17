import { prepareEventListenerParameters } from "@angular/compiler/src/render3/view/template";
import { ChangeDetectorRef } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BbxSidebarService } from "src/app/services/bbx-sidebar.service";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, MoveRes } from "src/app/services/keyboard-navigation.service";
import { SideBarFormService } from "src/app/services/side-bar-form.service";
import { Constants } from "src/assets/util/Constants";
import { Actions, DefaultKeySettings, GetFooterCommandListFromKeySettings as GetFooterCommandListFromKeySettings, KeyBindings } from "src/assets/util/KeyBindings";
import { environment } from "src/environments/environment";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { ModelFieldDescriptor } from "../ModelFieldDescriptor";
import { TreeGridNode } from "../TreeGridNode";
import { IUpdater, IUpdateRequest } from "../UpdaterInterfaces";
import { BaseNavigatableForm } from "./BaseNavigatableForm";
import { FlatDesignNavigatableTable } from "./FlatDesignNavigatableTable";
import { BlankComboBoxValue } from "./Nav";
import { INavigatable, AttachDirection, TileCssClass, TileCssColClass } from "./Navigatable";

export class FlatDesignNavigatableForm<T = any> extends BaseNavigatableForm {
    colDefs: ModelFieldDescriptor[];
    private DataRowIndex: number = -1;

    public KeySetting: Constants.KeySettingsDct = DefaultKeySettings;
    override commandsOnForm: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

    public defaultConfirmationSettings: Constants.Dct = {
        'ActionLock': true,
        'ActionNew': true,
        'ActionReset': false,
        'ActionPut': true,
        'ActionDelete': true,
        'ActionExit': false
    }

    constructor(
        f: FormGroup,
        kbS: KeyboardNavigationService,
        cdref: ChangeDetectorRef,
        data: any[],
        formId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        colDefs: ModelFieldDescriptor[],
        private sidebarService: BbxSidebarService,
        private sidebarFormSercie: SideBarFormService,
        private grid: FlatDesignNavigatableTable<T>,
        fS: FooterService
    ) {
        super(
            f,
            kbS,
            cdref,
            data,
            formId,
            attachDirection,
            fS
        );

        this.colDefs = colDefs;

        this.SetFormStateToDefault();

        console.log("[ctor FlatDesignNavigatableForm] Params in order (without services): ", f, data, attachDirection, formId, colDefs); // TODO: only for debug

        this.sidebarService.onCollapse().subscribe({
            next: value => {
                if (!!this.LeftNeighbour || !!this.RightNeighbour || !!this.DownNeighbour || !!this.UpNeighbour) {
                    if (!this.kbS.IsCurrentNavigatable(this)) {
                        this.kbS.SetCurrentNavigatable(this);
                    }
                    this.Detach(this.PreviousXOnGrid, this.PreviousYOnGrid);
                    this.grid.PushFooterCommandList();
                }
                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            },
            complete: () => {
                this.kbS.isEditModeLocked = false;
            }
        });
    }

    override HandleFormEscape(): void {
        if (!this.kbS.isEditModeActivated) {
            this.ActionExit()
        }
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.cdref.detectChanges();
    }

    override ActionExit(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        this.grid.ExitFromForm({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionExit.name]
        } as IUpdateRequest);
    }

    override ActionLock(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        this.grid.Lock({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionLock.name]
        } as IUpdateRequest);
    }

    override ActionNew(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        if (this.form.invalid) {
            return;
        }
        this.grid.New({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionNew.name] && data?.needConfirmation
        } as IUpdateRequest);
    }

    override ActionReset(data?: IUpdateRequest<T>): void {
        this.grid.Reset({
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionReset.name]
        } as IUpdateRequest);
    }

    override ActionPut(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        if (this.form.invalid) {
            return;
        }
        this.grid.Put({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionPut.name] && data?.needConfirmation
        } as IUpdateRequest);
    }

    override ActionDelete(data?: IUpdateRequest<T>): void {
        this.grid.Delete({
            data: this.DataToEdit?.data,
            rowIndex: this.DataRowIndex,
            needConfirmation: this.defaultConfirmationSettings[this.ActionDelete.name]
        } as IUpdateRequest);
    }

    override ActionRefresh(data?: IUpdateRequest<T>): void {
        this.grid.Refresh();
    }

    override HandleFormFieldClick(event: any): void {
        if (this.kbS.IsCurrentNavigatable(this.grid)) {
            // this.GenerateAndSetNavMatrices(false);
            this.grid.JumpToFlatDesignFormByForm(event.target?.id);
        } else {
            this.kbS.setEditMode(KeyboardModes.EDIT);
            this.kbS.SetPositionById(event.target?.id);
        }
    }

    public override SetDataForEdit(row: TreeGridNode<any>, rowPos: number, objectKey: string): void {
        if (environment.flatDesignFormDebug) {
            console.log("[SetDataForEdit] Form: ", this.form, ", row: ", row); // TODO: only for debug
        }
        console.log("[SetDataForEdit] Form: ", this.form, ", row: ", row); // TODO: only for debug
        this.DataRowIndex = rowPos;
        this.DataToEdit = row;
        this.FillFormWithObject(this.DataToEdit?.data);
        this.SetFormStateToDefault();
    }

    protected override JumpToNextInput(event?: Event): void {
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
            this.sidebarService.collapse();
            this.Detach();
        }
    }

    protected override JumpToPreviousInput(event?: Event): void {
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
            this.sidebarService.collapse();
            this.Detach();
        }
    }

    override HandleFunctionKey(event: Event | KeyBindings): void {
        const val = event instanceof Event ? (event as KeyboardEvent).code : event;
        switch (val) {
            // NEW
            case this.KeySetting[Actions.Create].KeyCode:
                console.log(`FlatDesignNavigatableForm - HandleFunctionKey - ${this.KeySetting[Actions.Create].FunctionLabel}, ${Actions[Actions.Create]}`);
                switch (this.formMode) {
                    case Constants.FormState.new:
                    case Constants.FormState.default:
                    default:
                        this.formMode = Constants.FormState.new;
                        this.grid.JumpToFirstFormField();
                        this.grid.SetBlankInstanceForForm(false, false);
                        break;
                }
                break;
            // RESET
            case this.KeySetting[Actions.Reset].KeyCode:
                console.log(`FlatDesignNavigatableForm - HandleFunctionKey - ${this.KeySetting[Actions.Reset].FunctionLabel}, ${Actions[Actions.Reset]}`);
                this.ActionReset();
                break;
            // SAVE
            case this.KeySetting[Actions.Save].KeyCode:
                console.log(`FlatDesignNavigatableForm - HandleFunctionKey - ${this.KeySetting[Actions.Save].FunctionLabel}, ${Actions[Actions.Save]}`);
                switch (this.formMode) {
                    case Constants.FormState.new:
                        this.ActionNew();
                        break;
                    case Constants.FormState.default:
                        this.ActionPut();
                        break;
                }
                break;
            // LOCK
            case this.KeySetting[Actions.Lock].KeyCode:
                console.log(`FlatDesignNavigatableForm - HandleFunctionKey - ${this.KeySetting[Actions.Lock].FunctionLabel}, ${Actions[Actions.Lock]}`);
                this.ActionLock();
                break;
            // DELETE
            case this.KeySetting[Actions.Delete].KeyCode:
                console.log(`FlatDesignNavigatableForm - HandleFunctionKey - ${this.KeySetting[Actions.Delete].FunctionLabel}, ${Actions[Actions.Delete]}`);
                switch (this.formMode) {
                    case Constants.FormState.default:
                        if (this.sidebarService.sideBarOpened) {
                            this.ActionDelete();
                        }
                        break;
                }
                break;
        }
    }

    override HandleKey(event: any): void {
        switch (event.key) {
            case this.KeySetting[Actions.Create].KeyCode: {
                console.log(`FlatDesignNavigatableForm - HandleKey - ${this.KeySetting[Actions.Create].FunctionLabel}, ${Actions[Actions.Create]}`);
                event.preventDefault();
                event.stopPropagation();
                this.ActionNew();
                break;
            }
            case this.KeySetting[Actions.Reset].KeyCode: {
                console.log(`FlatDesignNavigatableForm - HandleKey - ${this.KeySetting[Actions.Reset].FunctionLabel}, ${Actions[Actions.Reset]}`);
                event.preventDefault();
                event.stopPropagation();
                this.ActionReset();
                break;
            }
            case this.KeySetting[Actions.Save].KeyCode: {
                console.log(`FlatDesignNavigatableForm - HandleKey - ${this.KeySetting[Actions.Save].FunctionLabel}, ${Actions[Actions.Save]}`);
                event.preventDefault();
                event.stopPropagation();
                this.ActionPut();
                break;
            }
            case this.KeySetting[Actions.Delete].KeyCode: {
                console.log(`FlatDesignNavigatableForm - HandleKey - ${this.KeySetting[Actions.Delete].FunctionLabel}, ${Actions[Actions.Delete]}`);
                switch (this.formMode) {
                    case Constants.FormState.default:
                        if (this.sidebarService.sideBarOpened) {
                            event.preventDefault();
                            event.stopPropagation();
                            this.ActionDelete();
                        }
                        break;
                }
                break;
            }
            case this.KeySetting[Actions.ToggleForm].KeyCode: {
                console.log(`FlatDesignNavigatableForm - HandleKey - ${this.KeySetting[Actions.ToggleForm].FunctionLabel}, ${Actions[Actions.ToggleForm]}`);
                event.preventDefault();
                this.kbS.isEditModeLocked = true;
                this.sidebarService.collapse();
                break;
            }
            default: { }
        }
    }
}