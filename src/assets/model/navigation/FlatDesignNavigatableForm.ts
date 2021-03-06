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
    override readonly commandsOnForm: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

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

    override ActionNew(data?: IUpdateRequest<T>): void {
        const dt = this.FillObjectWithForm();
        if (this.form.invalid) {
            return;
        }
        this.grid.New({
            data: dt,
            rowIndex: this.DataRowIndex,
            needConfirmation: data?.needConfirmation ?? false
        } as IUpdateRequest);
    }

    override ActionReset(data?: IUpdateRequest<T>): void {
        this.grid.Reset({
            rowIndex: this.DataRowIndex,
            needConfirmation: false
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
            needConfirmation: data?.needConfirmation ?? false
        } as IUpdateRequest);
    }

    override ActionDelete(data?: IUpdateRequest<T>): void {
        this.grid.Delete({
            data: this.DataToEdit?.data,
            rowIndex: this.DataRowIndex,
            needConfirmation: true
        } as IUpdateRequest);
    }

    override ActionRefresh(data?: IUpdateRequest<T>): void {
        this.grid.Refresh();
    }

    override HandleFunctionKey(event: Event | KeyBindings): void {
        const val = event instanceof Event ? (event as KeyboardEvent).code : event;
        switch (val) {
            // NEW
            case this.KeySetting[Actions.CrudNew].KeyCode:
                switch (this.formMode) {
                    case Constants.FormState.new:
                    case Constants.FormState.default:
                    default:
                        this.grid.SetBlankInstanceForForm(false, false);
                        this.formMode = Constants.FormState.new;
                        this.grid.JumpToFirstFormField();
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

    override HandleKey(event: any): void {
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
}