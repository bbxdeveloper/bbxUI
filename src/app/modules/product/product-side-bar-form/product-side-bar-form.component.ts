import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
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
  currentProductGroupCount: number = 0;
  filteredProductGroups$: Observable<string[]> = of([]);
  currentFilteredProductGroups: string[] = [];
  currentTypedProductGroup: string = '';

  // UnitOfMeasure
  uom: string[] = [];
  currentUomCount: number = 0;
  filteredUom$: Observable<string[]> = of([]);
  currentFilteredUOM: string[] = [];
  currentTypedUOM: string = '';

  // Origin
  origins: string[] = [];
  currentOriginCount: number = 0;
  filteredOrigins$: Observable<string[]> = of([]);
  currentFilteredOrigin: string[] = [];
  currentTypedOrigin: string = '';

  // Origin
  vatRates: string[] = [];
  currentVatRateCount: number = 0;
  filteredVatRates$: Observable<string[]> = of([]);
  currentFilteredVatRate: string[] = [];
  currentTypedVatRate: string = '';

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
        this.productGroups = [this.blankOptionText];
        this.productGroups =
          this.productGroups.concat(data?.data?.map(x => x.productGroupCode + '-' + x.productGroupDescription) ?? []);
        this.filteredProductGroups$ = of(this.productGroups);
        this.currentFilteredProductGroups = this.productGroups;
        this.currentProductGroupCount = this.productGroups.length;
      }
    });

    // UnitOfMeasure
    this.productApi.GetAllUnitOfMeasures().subscribe({
      next: data => {
        console.log("UnitOfMeasures: ", data);
        this.uom = data?.map(x => x.text) ?? [];
        this.filteredUom$ = of(this.uom);
        this.currentFilteredUOM = this.uom;
        this.currentUomCount = this.uom.length;
      }
    });

    // Origin
    this.originApi.GetAll().subscribe({
      next: data => {
        console.log("Origins: ", data);
        this.origins = [this.blankOptionText];
        this.origins = this.origins.concat(data?.data?.map(x => x.originCode + '-' + x.originDescription) ?? []);
        this.filteredOrigins$ = of(this.origins);
        this.currentFilteredOrigin = this.origins;
        this.currentOriginCount = this.origins.length;
      }
    });

    // VatRate
    this.vatApi.GetAll().subscribe({
      next: data => {
        console.log("Vats: ", data);
        this.vatRates = data?.data?.map(x => x.vatRateCode + ' - ' + x.vatPercentage) ?? [];
        this.filteredVatRates$ = of(this.vatRates);
        this.currentFilteredVatRate = this.vatRates;
        this.currentVatRateCount = this.vatRates.length;
      }
    });
  }

  private SetNewForm(form?: FormSubject): void {
    console.log(form);
    if ((!!form && form[0] !== 'Product') || !!!form) {
      return;
    }

    this.currentForm = form[1];
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();

    this.currentTypedProductGroup = this.currentForm?.form.controls['productGroup'].value ?? '';
    this.currentTypedOrigin = this.currentForm?.form.controls['origin'].value ?? '';
    this.currentTypedUOM = this.currentForm?.form.controls['unitOfMeasure'].value ?? '';
    this.currentTypedVatRate = this.currentForm?.form.controls['vatRateCode'].value ?? '';

    this.currentForm?.form.controls['productGroup'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterProductGroup(filterString);
        this.currentTypedProductGroup = filterString ?? '';
        this.currentProductGroupCount = tmp.length;
        this.filteredProductGroups$ = of(tmp);
      }
    });
    this.currentForm?.form.controls['origin'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterOrigin(filterString);
        this.currentTypedProductGroup = filterString ?? '';
        this.currentOriginCount = tmp.length;
        this.filteredOrigins$ = of(tmp);
      }
    });
    this.currentForm?.form.controls['unitOfMeasure'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterUom(filterString);
        this.currentTypedUOM = filterString ?? '';
        this.currentUomCount = tmp.length;
        this.filteredUom$ = of(tmp);
      }
    });
    this.currentForm?.form.controls['vatRateCode'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterVatRate(filterString);
        this.currentTypedVatRate = filterString ?? '';
        this.currentVatRateCount = tmp.length;
        this.filteredVatRates$ = of(tmp);
      }
    });
  }

  private filterProductGroup(value: string): string[] {
    if (value === undefined) {
      return this.productGroups;
    }
    const filterValue = value.toLowerCase();
    return this.productGroups.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
  }

  private filterUom(value: string): string[] {
    if (value === undefined) {
      return this.uom;
    }
    const filterValue = value.toLowerCase();
    return this.uom.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }

  private filterOrigin(value: string): string[] {
    if (value === undefined) {
      return this.origins;
    }
    const filterValue = value.toLowerCase();
    return this.origins.filter(optionValue => optionValue === this.blankOptionText || optionValue.toLowerCase().includes(filterValue));
  }

  private filterVatRate(value: string): string[] {
    if (value === undefined) {
      return this.vatRates;
    }
    const filterValue = value.toLowerCase();
    return this.vatRates.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }
}