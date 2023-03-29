import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { DateIntervalDialogResponse } from 'src/assets/model/DateIntervalDialogResponse';
import { TileCssClass } from 'src/assets/model/navigation/Nav';

@Component({
  selector: 'app-one-button-message-dialog',
  templateUrl: './one-button-message-dialog.component.html',
  styleUrls: ['./one-button-message-dialog.component.scss']
})
export class OneButtonMessageDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";
  @Input() message: string = "";

  closedManually = false;

  disableButton: boolean = true;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<OneButtonMessageDialogComponent>,
    private kbS: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["dialog-button-close"]];
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
    setTimeout(() => {
      this.disableButton = false;
    }, 500);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close({
      answer: answer
    } as DateIntervalDialogResponse);
  }
}