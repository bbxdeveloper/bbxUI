import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../../shared/base-side-bar-form/base-side-bar-form.component';
import { LocationService } from '../../../location/services/location.service';

@Component({
  selector: 'app-customer-invoice-summary-side-bar-form',
  templateUrl: './customer-invoice-summary-side-bar-form.component.html',
  styleUrls: ['./customer-invoice-summary-side-bar-form.component.scss']
})
export class CustomerInvoiceSummarySideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'CustomerInvoiceSummaryManager';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns = Constants.ProductCodePatterns;

  constructor(private sbf: SideBarFormService, kbS: KeyboardNavigationService,
    private locationService: LocationService,
    cdref: ChangeDetectorRef) {
    super(kbS, cdref);
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
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
}