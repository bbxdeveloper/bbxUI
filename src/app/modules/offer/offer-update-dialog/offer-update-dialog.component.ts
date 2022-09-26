import { AfterContentInit, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { OfferUtil } from '../models/OfferUtil';

@Component({
  selector: 'app-offer-update-dialog',
  templateUrl: './offer-update-dialog.component.html',
  styleUrls: ['./offer-update-dialog.component.scss']
})
export class OfferUpdateDialogComponent extends BaseNavigatableComponentComponent implements AfterContentInit, OnDestroy {
  @Input() msg: string = "";
  closedManually = false;

  public get offerEditSaveOptions(): typeof OfferUtil.EditSaveModes {
    return OfferUtil.EditSaveModes;
  }

  constructor(
    protected dialogRef: NbDialogRef<OfferUpdateDialogComponent>,
    private kBs: KeyboardNavigationService
  ) {
    super();
    this.Setup();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["button-1", "button-2", "button-3"]];
  }

  ngAfterContentInit(): void {
    this.kBs.SetWidgetNavigatable(this);
    this.kBs.SelectFirstTile();
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kBs.RemoveWidgetNavigatable();
    }
  }

  close(answer: number) {
    this.closedManually = true;
    this.kBs.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }
}
