import { AfterContentInit, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../base-navigatable-component/base-navigatable-component.component';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy {
  @Input() msg: string = "";
  closedManually = false;

  constructor(
    protected dialogRef: NbDialogRef<ConfirmationDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  ngAfterContentInit(): void {
    this.kBs.SetActiveDialog(this);
    this.kBs.SelectFirstTile();
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveActiveDialog();
    }
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kBs.RemoveActiveDialog();
    this.dialogRef.close(answer);
  }
}
