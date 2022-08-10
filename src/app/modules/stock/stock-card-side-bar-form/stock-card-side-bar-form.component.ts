import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { CustomerService } from '../../customer/services/customer.service';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';

@Component({
  selector: 'app-stock-card-side-bar-form',
  templateUrl: './stock-card-side-bar-form.component.html',
  styleUrls: ['./stock-card-side-bar-form.component.scss']
})
export class StockCardSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns: any = {
    'X': { pattern: new RegExp('\[A-Z0-9\]'), symbol: 'X' },
    'Y': { pattern: new RegExp('\[A-Z\]'), symbol: 'Y' },
  };

  // Origin
  countryCodes: string[] = [];
  countryCodeComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private sbf: SideBarFormService,
    private sb: NbSidebarService,
    kbS: KeyboardNavigationService,
    private cService: CustomerService,
    private cdref: ChangeDetectorRef) {
    super(kbS);
    this.refreshComboboxData();
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private refreshComboboxData(): void {
    // CountryCodes
    this.cService.GetAllCountryCodes().subscribe({
      next: data => {
        this.countryCodes = data?.map(x => x.text) ?? [];
        this.countryCodeComboData$.next(this.countryCodes);
      }
    });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'StockCard') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();
  }
}