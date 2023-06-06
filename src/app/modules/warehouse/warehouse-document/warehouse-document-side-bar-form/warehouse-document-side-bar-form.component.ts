import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings, WarehouseDocumentsKeySettings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../../shared/base-side-bar-form/base-side-bar-form.component';
import { LocationService } from '../../../location/services/location.service';
import { CommonService } from 'src/app/services/common.service';
import { WhsTransferStatus } from '../../models/whs/WhsTransferStatus';
import { WhsStatus, WhsTransferService } from '../../services/whs-transfer.service';

@Component({
  selector: 'app-warehouse-document-side-bar-form',
  templateUrl: './warehouse-document-side-bar-form.component.html',
  styleUrls: ['./warehouse-document-side-bar-form.component.scss']
})
export class WarehouseDocumentSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'WarehouseDocumentManager';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }
  
  public override KeySetting: Constants.KeySettingsDct = WarehouseDocumentsKeySettings;

  customPatterns = Constants.ProductCodePatterns;

  statuses: WhsTransferStatus[] = []

  get isWhsReady(): boolean {
    if (this.currentForm?.form?.controls !== undefined &&
      this.currentForm?.form?.controls['whsTransferStatusX'] !== undefined &&
      this.statuses.length > 0) {
      return this.statuses.findIndex(x => x.text === this.currentForm!.form.controls['whsTransferStatusX'].value && x.value == WhsStatus.READY) !== -1
    }
    return false
  }

  constructor(private sbf: SideBarFormService, kbS: KeyboardNavigationService,
    private locationService: LocationService, private whsService: WhsTransferService,
    cdref: ChangeDetectorRef, private cs: CommonService) {
    super(kbS, cdref);
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  async ngOnInit(): Promise<void> {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
    await this.refreshComboboxData()
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  SetCursorPose(event: any): void {
    setTimeout(() => {
      console.log("SetCursorPose: ", event.target.value);
      event.target.setSelectionRange(0, 0);
    }, 50);
  }

  private async refreshComboboxData(): Promise<void> {
    // ProductGroups
    await this.whsService.GetAllWhsTransferStatusPromise()
      .then(data => {
        this.statuses = data
      })
      .catch(err => {
        this.cs.HandleError(err)
      })
  }
}