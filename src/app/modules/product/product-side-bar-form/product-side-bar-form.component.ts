import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-side-bar-form',
  templateUrl: './product-side-bar-form.component.html',
  styleUrls: ['./product-side-bar-form.component.scss']
})
export class ProductSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  // ProductGroup
  productGroups: string[] = [];
  productGroupComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  // UnitOfMeasure
  uom: string[] = [];
  uomComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  
  // Origin
  origins: string[] = [];
  originsComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  
  // Origin
  vatRates: string[] = [];
  vatRateComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, kbS: KeyboardNavigationService,
    private productGroupApi: ProductGroupService, private productApi: ProductService, private originApi: OriginService,
    private vatApi: VatRateService,
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
    // ProductGroups
    this.productGroupApi.GetAll().subscribe({
      next: data => {
        console.log("ProductGroups: ", data);
        this.productGroups = data?.data?.map(x => x.productGroupCode + '-' + x.productGroupDescription) ?? [];
        this.productGroupComboData$.next(this.productGroups);
      }
    });

    // UnitOfMeasure
    this.productApi.GetAllUnitOfMeasures().subscribe({
      next: data => {
        console.log("UnitOfMeasures: ", data);
        this.uom = data?.map(x => x.text) ?? [];
        this.uomComboData$.next(this.uom);
      }
    });

    // Origin
    this.originApi.GetAll().subscribe({
      next: data => {
        console.log("Origins: ", data);
        this.origins = data?.data?.map(x => x.originCode + '-' + x.originDescription) ?? [];
        this.originsComboData$.next(this.origins);
      }
    });

    // VatRate
    this.vatApi.GetAll().subscribe({
      next: data => {
        console.log("Vats: ", data);
        this.vatRates = data?.data?.map(x => x.vatRateCode + ' - ' + x.vatPercentage) ?? [];
        this.vatRateComboData$.next(this.vatRates);
      }
    });
  }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'Product') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();
  }
}