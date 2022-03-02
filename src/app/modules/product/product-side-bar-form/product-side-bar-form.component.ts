import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

    this.filteredProductGroups$ = this.currentForm?.form.controls['productGroup'].valueChanges
      .pipe(
        startWith(''),
        map(filterString => this.filterProductGroup(filterString)),
      );
    this.filteredOrigins$ = this.currentForm?.form.controls['origin'].valueChanges
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