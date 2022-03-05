import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-side-bar-form',
  templateUrl: './product-side-bar-form.component.html',
  styleUrls: ['./product-side-bar-form.component.scss']
})
export class ProductSideBarFormComponent extends BaseSideBarFormComponent implements OnInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  TileCssClass = TileCssClass;

  // ProductGroup
  productGroups: string[] = [];
  filteredProductGroups$: Observable<string[]> | undefined = of([]);

  // UnitOfMeasure
  uom: string[] = [];
  filteredUom$: Observable<string[]> | undefined = of([]);

  // Origin
  origins: string[] = [];
  filteredOrigins$: Observable<string[]> | undefined = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, private kbS: KeyboardNavigationService,
    private productGroupApi: ProductGroupService, private productApi: ProductService, private originApi: OriginService,
    private cdref: ChangeDetectorRef) {
    super();
    this.refreshComboboxData();
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }

  private refreshComboboxData(): void {
    // ProductGroups
    this.productGroupApi.GetAll().subscribe({
      next: data => {
        this.productGroups = data?.data?.map(x => x.productGroupDescription) ?? [];
        this.filteredProductGroups$ = of(this.productGroups);
      }
    });

    // UnitOfMeasure
    this.productApi.GetAllUnitOfMeasures().subscribe({
      next: data => {
        this.uom = data?.map(x => x.text) ?? [];
        this.filteredUom$ = of(this.uom);
      }
    });

    // Origin
    this.originApi.GetAll().subscribe({
      next: data => {
        this.origins = data?.data?.map(x => x.originDescription) ?? [];
        this.filteredOrigins$ = of(this.origins);
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

    this.currentForm?.form.controls['productGroup'].valueChanges.subscribe({
      next: filterString => { this.filteredProductGroups$ = of(this.filterProductGroup(filterString)); }
    });
    this.currentForm?.form.controls['origin'].valueChanges.subscribe({
      next: filterString => { this.filteredOrigins$ = of(this.filterOrigin(filterString)); }
    });
    this.currentForm?.form.controls['unitOfMeasure'].valueChanges.subscribe({
      next: filterString => { this.filteredUom$ = of(this.filterUom(filterString)); }
    });
  }

  private filterProductGroup(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.productGroups.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }

  private filterUom(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.uom.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }

  private filterOrigin(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.origins.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
  }
}