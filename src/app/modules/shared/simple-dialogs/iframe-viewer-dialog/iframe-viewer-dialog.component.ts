import { Component, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { KeyboardNavigationService, KeyboardModes } from "src/app/services/keyboard-navigation.service";
import { DateIntervalDialogResponse } from "src/assets/model/DateIntervalDialogResponse";
import { TileCssClass } from "src/assets/model/navigation/Navigatable";
import { BaseNavigatableComponentComponent } from "../../base-navigatable-component/base-navigatable-component.component";

@Component({
  selector: 'app-iframe-viewer-dialog',
  templateUrl: './iframe-viewer-dialog.component.html',
  styleUrls: ['./iframe-viewer-dialog.component.scss']
})
export class IframeViewerDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "";
  @Input() srcDoc: string = "";

  closedManually = false;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<IframeViewerDialogComponent>,
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