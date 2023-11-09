import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { BehaviorSubject } from 'rxjs';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { BlankComboBoxValue } from 'src/assets/model/navigation/Nav';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroup } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { ProductService } from '../services/product.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';

@Component({
  selector: 'app-product-side-bar-form',
  templateUrl: './product-side-bar-form.component.html',
  styleUrls: ['./product-side-bar-form.component.scss']
})
export class ProductSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  override tag = 'Product';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  productCodeMask = Constants.ProductCodeMaskNew

  // ProductGroup
  _productGroups: ProductGroup[] = [];
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
    cdref: ChangeDetectorRef) {
    super(kbS, cdref);
    this.refreshComboboxData();
  }

  moveCursor(codeInput: any): void {
    setTimeout(() => {
      const cursorLocation = codeInput.value.length
      codeInput.setSelectionRange(cursorLocation, cursorLocation);
    }, 100);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private refreshComboboxData(): void {
    // ProductGroups
    this.productGroupApi.GetAll({ PageSize: '99999' }).subscribe({
      next: data => {
        console.log("ProductGroups: ", data);
        this._productGroups = data?.data ?? [];
        this.productGroups = this._productGroups.map(x => x.productGroupDescription) ?? [];
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
    this.originApi.GetAll({ PageSize: '99999' }).subscribe({
      next: data => {
        console.log("Origins: ", data);
        this.origins = data?.data?.map(x => x.originDescription) ?? [];
        this.originsComboData$.next(this.origins);
      }
    });

    // VatRate
    this.vatApi.GetAll({ PageSize: '99999' }).subscribe({
      next: data => {
        console.log("Vats: ", data);
        this.vatRates = data?.data?.map(x => x.vatRateDescription) ?? [];
        this.vatRateComboData$.next(this.vatRates);
      }
    });
  }

  SetCursorPose(event: any): void {
    setTimeout(() => {
      console.log("SetCursorPose: ", event.target.value);
      event.target.setSelectionRange(0, 0);
    }, 50);
  }

  override SetupForms(): void {
    this.currentForm?.form.controls['productCode'].valueChanges.subscribe({
      next: this.onProductCodeValueChanges()
    })
  }

  private onProductCodeValueChanges() {
    let previousValue = ''

    return (newValue: string) => {
      if (HelperFunctions.isEmptyOrSpaces(newValue)) {
        return
      }

      const delta = newValue.length - previousValue.length
      if ((delta === 2 || delta === 3) && newValue.endsWith('-')) {
        this.currentForm?.form.controls['productCode'].setValue(newValue.slice(0, -1))

        return
      }

      let currentProductGroup = this.currentForm?.form.controls['productGroup'].value;
      if (!!newValue && newValue.length >= 3 &&
        (currentProductGroup === undefined || currentProductGroup.length === 0)) {

        let defaultProductGroup = this._productGroups
          .find(x => x.productGroupCode === newValue.substring(0,3))?.productGroupDescription ?? BlankComboBoxValue;

        if (defaultProductGroup.length > 0) {
          this.currentForm?.form.controls['productGroup'].setValue(defaultProductGroup);
        }
      }

      previousValue = newValue
    }
  }
}