import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TileCssClass, AttachDirection, TileCssColClass, NavMatrixOrientation } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { InvoiceService } from '../services/invoice.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { Invoice } from '../models/Invoice';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { BaseNoFormManagerComponent } from '../../shared/base-no-form-manager/base-no-form-manager.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseNoFormManagerComponent<Invoice> implements OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  override allColumns = [
    'invoiceNumber',
    'customerName',
    'warehouse',
    'invoiceDeliveryDate',
    'paymentDate',
    'paymentMethodX',
    'invoiceNetAmount',
    'invoiceVatAmount',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám',
      objectKey: 'invoiceNumber',
      colKey: 'invoiceNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '15%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Vevő',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Számlázás ideje',
      objectKey: 'invoiceDeliveryDate',
      colKey: 'invoiceDeliveryDate',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Fizetési határidő',
      objectKey: 'paymentDate',
      colKey: 'paymentDate',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Fizetési mód',
      objectKey: 'paymentMethodX',
      colKey: 'paymentMethodX',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó érték',
      objectKey: 'invoiceNetAmount',
      colKey: 'invoiceNetAmount',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Áfás érték',
      objectKey: 'invoiceVatAmount',
      colKey: 'invoiceVatAmount',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  override get getInputParams(): GetInvoicesParamListModel {
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      Incoming: this.filterForm.controls['Incoming'].value,

      WarehouseCode: HelperFunctions
        .ConvertChosenWareHouseToCode(this.filterForm.controls['WarehouseCode'].value, this.wh, ''),

      // Radio 1
      InvoiceIssueDateFrom: this.isIssueFilterSelected ?
        HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['InvoiceIssueDateFrom'].value) : null,
      InvoiceIssueDateTo: this.isIssueFilterSelected ?
        HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['InvoiceIssueDateTo'].value) : null,

      // Radio 2
      InvoiceDeliveryDateFrom: this.isDeliveryFilterSelected ?
        HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['InvoiceDeliveryDateFrom'].value) : null,
      InvoiceDeliveryDateTo: this.isDeliveryFilterSelected ?
        HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['InvoiceDeliveryDateTo'].value) : null,
    };
  }

  filterFormId = 'invoices-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  // WareHouse
  wh: WareHouse[] = [];
  wareHouseData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get sumGrossAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0)
      +
      this.dbData
        .map(x => x.data)
        .map(x => x.invoiceVatAmount ?? 0)
        .reduce((sum, current) => sum + current, 0);
  }

  get sumNetAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  get sumVatAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.invoiceVatAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  readonly DefaultChosenDateFilter: string = '1';
  get chosenDateFilter(): string {
    return this.filterForm.controls['DateFilterChooser'].value ?? this.DefaultChosenDateFilter;
  }

  get isIssueFilterSelected(): boolean { return this.chosenDateFilter === this.ChosenIssueFilterOptionValue; }
  get isDeliveryFilterSelected(): boolean { return this.chosenDateFilter === this.ChosenDeliveryFilterOptionValue; }

  get isIssueFilterSelectedAndValid(): boolean {
    return this.isIssueFilterSelected
      && this.filterForm.controls['InvoiceIssueDateFrom'].value !== undefined && this.filterForm.controls['InvoiceIssueDateFrom'].value.length > 0
      && this.filterForm.controls['InvoiceIssueDateTo'].value !== undefined && this.filterForm.controls['InvoiceIssueDateTo'].value.length > 0
      && this.filterForm.controls['InvoiceIssueDateFrom'].valid && this.filterForm.controls['InvoiceIssueDateTo'].valid
      && this.filterForm.controls['Incoming'].valid && this.filterForm.controls['WarehouseCode'].valid;
  }

  get isDeliveryFilterSelectedAndValid(): boolean {
    return this.isDeliveryFilterSelected
      && this.filterForm.controls['InvoiceDeliveryDateFrom'].value !== undefined && this.filterForm.controls['InvoiceDeliveryDateFrom'].value.length > 0
      && this.filterForm.controls['InvoiceDeliveryDateTo'].value !== undefined && this.filterForm.controls['InvoiceDeliveryDateTo'].value.length > 0
      && this.filterForm.controls['InvoiceDeliveryDateFrom'].valid && this.filterForm.controls['InvoiceDeliveryDateTo'].valid
      && this.filterForm.controls['Incoming'].valid && this.filterForm.controls['WarehouseCode'].valid;
  }

  get invoiceIssueDateFromValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateFrom'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }
  get invoiceIssueDateToValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateTo'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  get invoiceDeliveryDateFromValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateFrom'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }
  get invoiceDeliveryDateToValue(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceDeliveryDateTo'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private invoiceService: InvoiceService,
    private wareHouseApi: WareHouseService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.refreshComboboxData();

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'invoices-table';
    this.dbDataTableEditId = 'invoices-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  validateInvoiceIssueDateFrom(control: AbstractControl): any {
    if (this.invoiceIssueDateToValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) > this.invoiceIssueDateToValue;
    return wrong ? { maxDate: { value: control.value } } : null;
  }
  validateInvoiceIssueDateTo(control: AbstractControl): any {
    if (this.invoiceIssueDateFromValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.invoiceIssueDateFromValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateInvoiceDeliveryDateFrom(control: AbstractControl): any {
    if (this.invoiceDeliveryDateToValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) > this.invoiceDeliveryDateToValue;
    return wrong ? { maxDate: { value: control.value } } : null;
  }
  validateInvoiceDeliveryDateTo(control: AbstractControl): any {
    if (this.invoiceDeliveryDateFromValue === undefined) {
      return null;
    }
    const wrong = new Date(control.value) < this.invoiceDeliveryDateFromValue;
    return wrong ? { minDate: { value: control.value } } : null;
  }

  InitFormDefaultValues(): void {
    const dateStr = HelperFunctions.GenerateTodayFormFieldDateString();

    this.filterForm.controls['Incoming'].setValue(false);

    this.filterForm.controls['InvoiceIssueDateFrom'].setValue(dateStr);
    this.filterForm.controls['InvoiceIssueDateTo'].setValue(dateStr);
    this.filterForm.controls['InvoiceDeliveryDateFrom'].setValue(dateStr);
    this.filterForm.controls['InvoiceDeliveryDateTo'].setValue(dateStr);

    this.filterForm.controls['WarehouseCode'].setValue(this.wh[0]?.warehouseCode ?? '');

    this.filterForm.controls['DateFilterChooser'].setValue(this.DefaultChosenDateFilter);

  //   this.filterForm.controls['InvoiceIssueDateFrom'].valueChanges.subscribe({
  //     next: p => {
  //       this.filterForm.controls['InvoiceIssueDateTo']
  //         .setValue(this.filterForm.controls['InvoiceIssueDateTo'].value);
  //       this.filterForm.controls['InvoiceIssueDateTo'].markAsTouched();
  //     }
  //   });
  //   this.filterForm.controls['InvoiceIssueDateTo'].valueChanges.subscribe({
  //     next: p => {
  //       this.filterForm.controls['InvoiceIssueDateFrom']
  //         .setValue(this.filterForm.controls['InvoiceIssueDateFrom'].value);
  //       this.filterForm.controls['InvoiceIssueDateFrom'].markAsTouched();
  //     }
  //   });

  //   this.filterForm.controls['InvoiceDeliveryDateFrom'].valueChanges.subscribe({
  //     next: p => {
  //       this.filterForm.controls['InvoiceDeliveryDateTo']
  //         .setValue(this.filterForm.controls['InvoiceDeliveryDateTo'].value);
  //       this.filterForm.controls['InvoiceDeliveryDateTo'].markAsTouched();
  //     }
  //   });
  //   this.filterForm.controls['InvoiceDeliveryDateTo'].valueChanges.subscribe({
  //     next: p => {
  //       this.filterForm.controls['InvoiceDeliveryDateFrom']
  //         .setValue(this.filterForm.controls['InvoiceDeliveryDateFrom'].value);
  //       this.filterForm.controls['InvoiceDeliveryDateFrom'].markAsTouched();
  //     }
  //   });
  }

  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wh = data?.data ?? [];
        this.wareHouseData$.next(this.wh.map(x => x.warehouseDescription));
      }
    });
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      Incoming: new FormControl(false, []),
      WarehouseCode: new FormControl(undefined, []),
      InvoiceIssueDateFrom: new FormControl(undefined, [
        this.validateInvoiceIssueDateFrom.bind(this)
      ]),
      InvoiceIssueDateTo: new FormControl(undefined, [
        this.validateInvoiceIssueDateTo.bind(this)
      ]),
      InvoiceDeliveryDateFrom: new FormControl(undefined, [
        this.validateInvoiceDeliveryDateFrom.bind(this)
      ]),
      InvoiceDeliveryDateTo: new FormControl(undefined, [
        this.validateInvoiceDeliveryDateTo.bind(this)
      ]),
      DateFilterChooser: new FormControl(1, [])
    });

    this.filterForm.controls['Incoming'].valueChanges.subscribe({
      next: newValue => {
        console.log('Incoming value changed: ', newValue);
        if (this.isIssueFilterSelectedAndValid || this.isDeliveryFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterForm.controls['WarehouseCode'].valueChanges.subscribe({
      next: newValue => {
        console.log('WarehouseCode value changed: ', newValue);
        if (this.isIssueFilterSelectedAndValid || this.isDeliveryFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterForm.controls['DateFilterChooser'].valueChanges.subscribe({
      next: newValue => {
        console.log('DateFilterChooser value changed: ', newValue);
        let x = this.kbS.p.x;
        let y = this.kbS.p.y;
        setTimeout(() => {
          this.filterFormNav.GenerateAndSetNavMatrices(false, true, NavMatrixOrientation.ONLY_HORIZONTAL);
          this.kbS.SelectElementByCoordinate(x, y);
        }, 200);
      }
    });

    this.filterForm.controls['InvoiceIssueDateFrom'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceIssueDateFrom value changed: ', newValue);
        if (this.isIssueFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterForm.controls['InvoiceIssueDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceIssueDateTo value changed: ', newValue);
        if (this.isIssueFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateFrom'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceDeliveryDateFrom value changed: ', newValue);
        if (this.isDeliveryFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterForm.controls['InvoiceDeliveryDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('InvoiceDeliveryDateTo value changed: ', newValue);
        if (this.isDeliveryFilterSelectedAndValid) {
          this.Refresh(this.getInputParams);
        }
      }
    });

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.sidebarService,
      this.fS,
      this.dbDataTable
    );

    this.dbDataTable = new FlatDesignNoFormNavigatableTable(
      this.dbDataTableForm,
      'Product',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.UP,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {} as Invoice;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: () => {
        this.Refresh(this.getInputParams);
      },
    });

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;

    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: GetInvoicesParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.invoiceService.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
            this.dbDataTable.allPages = this.GetPageCount(d.recordsFiltered, d.pageSize);
            this.dbDataTable.totalItems = d.recordsFiltered;
            this.dbDataTable.itemsOnCurrentPage = tempData.length;
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    $('*[type=radio]').addClass(TileCssClass);
    $('*[type=radio]').on('click', (event) => {
      this.filterFormNav.HandleFormFieldClick(event);
    });

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.dbDataTable.GenerateAndSetNavMatrices(false);
    this.dbDataTable.PushFooterCommandList();

    // this.filterFormNav?.AfterViewInitSetup();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private RefreshAll(params?: GetInvoicesParamListModel): void {
    // WareHouses
    this.wareHouseApi.GetAll().subscribe({
      next: (data) => {
        if (!!data.data) this.wh = data.data;
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.Refresh(params);
      },
    });
  }
}
