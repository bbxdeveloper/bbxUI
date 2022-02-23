import { ChangeDetectorRef } from "@angular/core";
import { FooterService } from "src/app/services/footer.service";
import { PreferredSelectionMethod, KeyboardNavigationService, KeyboardModes, MoveRes } from "src/app/services/keyboard-navigation.service";
import { FooterCommandInfo } from "../FooterCommandInfo";
import { INavigatable, AttachDirection } from "./Navigatable";

export class NavigatableInput implements INavigatable {
    Matrix: string[][] = [[]];

    LastX?: number | undefined;
    LastY?: number | undefined;

    HasSubMapping: boolean = false;
    SubMapping?: { [id: string]: INavigatable; } = undefined;

    IsDialog: boolean = false;

    InnerJumpOnEnter: boolean = true;
    OuterJump: boolean = true;

    LeftNeighbour?: INavigatable;
    RightNeighbour?: INavigatable;
    DownNeighbour?: INavigatable;
    UpNeighbour?: INavigatable;

    TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

    IsSubMapping: boolean = false;

    attachDirection: AttachDirection;

    inputId: string;

    readonly commandsOnForm: FooterCommandInfo[] = [
        { key: 'F1', value: '', disabled: false },
        { key: 'F2', value: '', disabled: false },
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
        inputId: string,
        attachDirection: AttachDirection = AttachDirection.DOWN,
        private kbS: KeyboardNavigationService,
        private cdref: ChangeDetectorRef,
        private fS: FooterService
    ) {
        this.attachDirection = attachDirection;
        this.inputId = inputId;
    }

    GetValue(): any {
        return $('#' + this.inputId).val();
    }

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
            this.Detach();
        }
    }

    HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
        event.preventDefault();

        if (toggleEditMode) {
            this.kbS.toggleEdit();
        }

        // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
        if (!this.kbS.isEditModeActivated && jumpNext) {
            this.JumpToNextInput(event);
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

    HandleKey(event: any): void {
        switch (event.key) {
            default: { }
        }
    }

    PushFooterCommandList(): void {
        this.fS.pushCommands(this.commandsOnForm);
    }

    ClearNeighbours(): void {
        this.LeftNeighbour = undefined;
        this.RightNeighbour = undefined;
        this.DownNeighbour = undefined;
        this.UpNeighbour = undefined;
    }

    GenerateAndSetNavMatrices(attach: boolean = false, setAsCurrentNavigatable: boolean = false): void {
        this.Matrix = [[this.inputId]];
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