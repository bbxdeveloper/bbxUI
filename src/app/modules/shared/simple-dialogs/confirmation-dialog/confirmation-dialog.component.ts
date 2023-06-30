import { Component, AfterContentInit, OnDestroy, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";
import { NavigatableType } from "src/assets/model/navigation/Navigatable";

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy {
  @Input() msg: string = "";
  closedManually = false;

  override NavigatableType = NavigatableType.dialog

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
      this.kBs.setEditMode(KeyboardModes.NAVIGATION);
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
}
