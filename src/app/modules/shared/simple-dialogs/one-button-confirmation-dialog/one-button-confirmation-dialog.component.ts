import { Component, AfterContentInit, OnDestroy, Input } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";

@Component({
  selector: 'app-one-button-confirmation-dialog',
  templateUrl: './one-button-confirmation-dialog.component.html',
  styleUrls: ['./one-button-confirmation-dialog.component.scss']
})
export class OneButtonConfirmationDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy {
  @Input() msg: string = "";
  @Input() buttonText: string = "";
  closedManually = false;

  constructor(
    protected dialogRef: NbDialogRef<OneButtonConfirmationDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button"]];
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
