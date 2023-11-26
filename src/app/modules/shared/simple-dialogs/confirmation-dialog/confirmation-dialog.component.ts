import { Component, AfterContentInit, OnDestroy, Input, HostListener } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";
import { NavigatableType } from "src/assets/model/navigation/Navigatable";
import { KeyBindings } from "src/assets/util/KeyBindings";

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy {
  @Input() msg: string = "";
  closedManually = false;

  override NavigatableType = NavigatableType.dialog

  pageReady: boolean = false

  constructor(
    protected dialogRef: NbDialogRef<ConfirmationDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-widget-dialog-button-yes", "confirm-widget-dialog-button-no"]];
  }

  ngAfterContentInit(): void {
    this.kBs.SetWidgetNavigatable(this);
    this.kBs.SelectFirstTile();
    setTimeout(() => {
      this.pageReady = true
      this.kBs.setEditMode(KeyboardModes.NAVIGATION);
      
      this.kBs.SelectFirstTile();
    }, 300);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {

    if (!this.pageReady) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
    }
    switch (event.key) {
      case KeyBindings.exit:
      case KeyBindings.exitIE:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.close(false)
        break;
    }
  }
}
