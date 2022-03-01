import { Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { map, Observable, of, startWith } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { FlatDesignNavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { Origin } from '../../origin/models/Origin';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroup } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { UnitOfMeasure } from '../models/UnitOfMeasure';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-side-bar-form',
  templateUrl: './product-side-bar-form.component.html',
  styleUrls: ['./product-side-bar-form.component.scss']
})
export class ProductSideBarFormComponent implements OnInit {
  // TODO: @Input() ?
  currentForm?: FlatDesignNavigatableForm;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  TileCssClass = TileCssClass;

  // ProductGroup
  productGroups: ProductGroup[] = [];
  filteredProductGroups$: Observable<ProductGroup[]> | undefined = of([]);

  // UnitOfMeasure
  uom: UnitOfMeasure[] = [];
  filteredUom$: Observable<UnitOfMeasure[]> | undefined = of([]);

  // Origin
  origins: Origin[] = [];
  filteredOrigins$: Observable<Origin[]> | undefined = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(private sbf: SideBarFormService, private sb: NbSidebarService, private kbS: KeyboardNavigationService,
    private productGroupApi: ProductGroupService, private productApi: ProductService, private originApi: OriginService) {
    this.refreshComboboxData();
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });

    this.filteredProductGroups$ = this.currentForm?.form.controls['productGroupID'].valueChanges
      .pipe(
        startWith(''),
        map(filterString => this.filterProductGroup(filterString)),
      );
    this.filteredOrigins$ = this.currentForm?.form.controls['originID'].valueChanges
      .pipe(
        startWith(''),
        map(filterString => this.filterOrigin(filterString)),
      );
    this.filteredUom$ = this.currentForm?.form.controls['unitOfMeasure'].valueChanges
      .pipe(
        startWith(''),
        map(filterString => this.filterUom(filterString)),
      );
  }

  private refreshComboboxData(): void {
    // ProductGroups
    this.productGroupApi.GetAll().subscribe({
      next: data => {
        this.productGroups = data.data!;
        this.filteredProductGroups$ = of(this.productGroups);
      }
    });

    // UnitOfMeasure
    this.productApi.GetAllUnitOfMeasures().subscribe({
      next: data => {
        this.uom = data.data!;
        this.filteredUom$ = of(this.uom);
      }
    });

    // Origin
    this.originApi.GetAll().subscribe({
      next: data => {
        this.origins = data.data!;
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
  }

  private filterProductGroup(value: string): ProductGroup[] {
    const filterValue = value.toLowerCase();
    return this.productGroups.filter(optionValue => optionValue.productGroupDescription.toLowerCase().includes(filterValue));
  }

  private filterUom(value: string): UnitOfMeasure[] {
    const filterValue = value.toLowerCase();
    return this.uom.filter(optionValue => optionValue.text.toLowerCase().includes(filterValue));
  }

  private filterOrigin(value: string): Origin[] {
    const filterValue = value.toLowerCase();
    return this.origins.filter(optionValue => optionValue.originDescription.toLowerCase().includes(filterValue));
  }

}