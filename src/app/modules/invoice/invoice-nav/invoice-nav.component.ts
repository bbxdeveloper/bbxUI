import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { Product } from 'electron';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { TileCssClass, AttachDirection, TileCssColClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { environment } from 'src/environments/environment';
import { Origin } from '../../origin/models/Origin';
import { OriginService } from '../../origin/services/origin.service';
import { ProductGroup, ProductGroupDescriptionToCode } from '../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { CreateProductRequest } from '../../product/models/CreateProductRequest';
import { DeleteProductRequest } from '../../product/models/DeleteProductRequest';
import { GetProductsParamListModel } from '../../product/models/GetProductsParamListModel';
import { UnitOfMeasure, UnitOfMeasureTextToValue } from '../../product/models/UnitOfMeasure';
import { UpdateProductRequest } from '../../product/models/UpdateProductRequest';
import { ProductService } from '../../product/services/product.service';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { VatRate } from '../../vat-rate/models/VatRate';
import { VatRateService } from '../../vat-rate/services/vat-rate.service';
import { GetInvoiceParamListModel } from '../models/GetInvoiceParamListModel';
import { InvoiceService } from '../services/invoice.service';
import { WareHouse } from '../../warehouse/models/WareHouse';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { Invoice } from '../models/Invoice';
import { GetInvoicesParamListModel } from '../models/GetInvoicesParamListModel';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { BaseNoFormManagerComponent } from '../../shared/base-no-form-manager/base-no-form-manager.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';

@Component({
  selector: 'app-invoice-nav',
  templateUrl: './invoice-nav.component.html',
  styleUrls: ['./invoice-nav.component.scss']
})
export class InvoiceNavComponent extends BaseNoFormManagerComponent<Invoice> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  override allColumns = [
    'InvoiceNumber',
    'CustomerName',
    'WarehouseName',
    'InvoiceDeliveryDate',
    'PaymentDate',
    'PaymentMethodX',
    'InvoiceNetAmount',
    'InvoiceVatAmount',
    'Notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám',
      objectKey: 'InvoiceNumber',
      colKey: 'InvoiceNumber',
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
      objectKey: 'CustomerName',
      colKey: 'CustomerName',
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
      objectKey: 'WarehouseName',
      colKey: 'WarehouseName',
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
      objectKey: 'InvoiceDeliveryDate',
      colKey: 'InvoiceDeliveryDate',
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
      objectKey: 'PaymentDate',
      colKey: 'PaymentDate',
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
      objectKey: 'PaymentMethodX',
      colKey: 'PaymentMethodX',
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
      objectKey: 'InvoiceNetAmount',
      colKey: 'InvoiceNetAmount',
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
      objectKey: 'InvoiceVatAmount',
      colKey: 'InvoiceVatAmount',
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
      objectKey: 'Notice',
      colKey: 'Notice',
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

  // Warehouse
  wh: WareHouse[] = [];

  override get getInputParams(): GetInvoicesParamListModel {
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),
      Incoming: this.filterForm.controls['Incoming'].value,
      InvoiceDeliveryDateFrom: this.filterForm.controls['InvoiceDeliveryDateFrom'].value,
      InvoiceDeliveryDateTo: this.filterForm.controls['InvoiceDeliveryDateTo'].value,
      InvoiceIssueDateFrom: this.filterForm.controls['InvoiceIssueDateFrom'].value,
      InvoiceIssueDateTo: this.filterForm.controls['InvoiceIssueDateTo'].value,
      WarehouseCode: this.filterForm.controls['WarehouseCode'].value,
    };
  }

  filterFormId = 'invoices-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  // WareHouse
  wareHouses: string[] = [];
  currentWareHouseCount: number = 0;
  filteredWareHouses$: Observable<string[]> = of([]);

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get sumGrossAmount(): any {
    return this.dbData
        .map(x => x.data)
        .map(x => x.InvoiceNetAmount ?? 0)
        .reduce((sum, current) => sum + current, 0)
        +
          this.dbData
          .map(x => x.data)
          .map(x => x.InvoiceVatAmount ?? 0)
          .reduce((sum, current) => sum + current, 0);
  }

  get sumNetAmount(): any {
    return this.dbData
      .map(x => x.data)
      .map(x => x.InvoiceNetAmount ?? 0)
      .reduce((sum, current) => sum + current, 0);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Invoice>>,
    private seInv: ProductService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private productGroupApi: ProductGroupService,
    private originApi: OriginService,
    private vatApi: VatRateService,
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

  InitFormDefaultValues(): void {
    const tmp = new Date();
    const year = tmp.getFullYear();

    let month = tmp.getMonth() + '';
    month = month.length === 1 ? '0' + month : month;

    let day = tmp.getDay() + '';
    day = day.length === 1 ? '0' + day : month;

    const dateStr = year + '-' + month + '-' + day;


    /*
    InvoiceIssueDateFrom: new FormControl(undefined, []),
      InvoiceIssueDateTo: new FormControl(undefined, []),
      InvoiceDeliveryDateFrom: new FormControl(undefined, []),
      InvoiceDeliveryDateTo: new FormControl(undefined, []),
    */

    this.filterForm.controls['InvoiceIssueDateFrom'].setValue(dateStr);
    this.filterForm.controls['InvoiceIssueDateTo'].setValue(dateStr);
    this.filterForm.controls['InvoiceDeliveryDateFrom'].setValue(dateStr);
    this.filterForm.controls['InvoiceDeliveryDateTo'].setValue(dateStr);

    this.filterForm.controls['WarehouseCode'].setValue(this.wh[0].warehouseCode);

    // this.filterForm.controls['invoiceIssueDate'].valueChanges.subscribe({
    //   next: p => {
    //     this.filterForm.controls['invoiceDeliveryDate'].setValue(this.filterForm.controls['invoiceDeliveryDate'].value);
    //     this.filterForm.controls['invoiceDeliveryDate'].markAsTouched();

    //     this.filterForm.controls['paymentDate'].setValue(this.outInvForm.controls['paymentDate'].value);
    //     this.filterForm.controls['paymentDate'].markAsTouched();
    //   }
    // });
  }
  
  private refreshComboboxData(): void {
    // WareHouse
    this.wareHouseApi.GetAll().subscribe({
      next: data => {
        this.wareHouses = data?.data?.map(x => x.warehouseCode + '-' + x.warehouseDescription) ?? [];
        this.filteredWareHouses$ = of(this.wareHouses);
        this.currentWareHouseCount = this.wareHouses.length;
      }
    });
  }

  private filterCounterGroup(value: string): string[] {
    if (value === undefined) {
      return this.wareHouses;
    }
    const filterValue = value.toLowerCase();
    return this.wareHouses.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
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
      InvoiceIssueDateFrom: new FormControl(undefined, []),
      InvoiceIssueDateTo: new FormControl(undefined, []),
      InvoiceDeliveryDateFrom: new FormControl(undefined, []),
      InvoiceDeliveryDateTo: new FormControl(undefined, []),
    });

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.sidebarService, this.sidebarFormService,
      this.dbDataTable,
      this.fS
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
      AttachDirection.RIGHT,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {} as Invoice;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });

    this.sidebarService.collapse();

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
    this.filterFormNav?.form.controls['WarehouseCode'].valueChanges.subscribe({
      next: filterString => {
        const tmp = this.filterCounterGroup(filterString);
        this.currentWareHouseCount = tmp.length;
        this.filteredWareHouses$ = of(tmp);
      }
    });

    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.filterFormNav?.AfterViewInitSetup();

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
