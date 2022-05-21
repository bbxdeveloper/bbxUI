import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FormControl, FormGroup } from '@angular/forms';
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
import { FlatDesignNoFormNavigatableTable } from 'src/assets/model/navigation/FlatDesignNoFormNavigatableTable';
import { BaseNoFormManagerComponent } from '../../shared/base-no-form-manager/base-no-form-manager.component';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Offer } from '../models/Offer';
import { GetOffersParamsModel } from '../models/GetOffersParamsModel';
import { OfferService } from '../services/offer.service';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { CountryCode } from '../../customer/models/CountryCode';

@Component({
  selector: 'app-offer-nav',
  templateUrl: './offer-nav.component.html',
  styleUrls: ['./offer-nav.component.scss']
})
export class OfferNavComponent extends BaseNoFormManagerComponent<Offer> implements OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  customerInputFilterString: string = '';

  cachedCustomerName?: string;
  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.filterFormNav.GenerateAndSetNavMatrices(false, true);
  }
  buyerData!: Customer;
  buyersData: Customer[] = [];

  override allColumns = [
    'offerNumber',
    'customerName',
    'offerIssueDate',
    'offerVaidityDate',
    'copies',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Ajánlat sorszáma',
      objectKey: 'offerNumber',
      colKey: 'offerNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '15%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ügyfélnév',
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
      label: 'Kiállítás dátuma',
      objectKey: 'offerIssueDate',
      colKey: 'offerIssueDate',
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
      label: 'Érvényesség',
      objectKey: 'offerVaidityDate',
      colKey: 'offerVaidityDate',
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
      label: 'Nyomtatva',
      objectKey: 'copies',
      colKey: 'copies',
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

  override get getInputParams(): GetOffersParamsModel {
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      OfferNumber: this.filterForm.controls['OfferNumber'].value,

      CustomerID: this.buyerData?.id === undefined ? this.buyerData?.id : this.buyerData?.id + '',
      
      OfferIssueDateFrom: HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['OfferIssueDateFrom'].value),
      OfferIssueDateTo: HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['OfferIssueDateTo'].value),

      OfferVaidityDateForm: HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['OfferVaidityDateForm'].value),
      OfferVaidityDateTo: HelperFunctions.FormFieldStringToDateTimeString(this.filterForm.controls['OfferVaidityDateTo'].value),
    };
  }

  filterFormId = 'offers-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get invoiceOfferIssueDateFrom(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['InvoiceIssueDateFrom'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }
  get invoiceOfferIssueDateTo(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferIssueDateTo'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  get invoiceOfferVaidityDateForm(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferVaidityDateForm'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }
  get invoiceOfferVaidityDateTo(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferVaidityDateTo'].value;

    return tmp === '____-__-__' || tmp === '' || tmp === undefined ? undefined : new Date(tmp);
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Offer>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private offerService: OfferService,
    private seC: CustomerService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'offers-table';
    this.dbDataTableEditId = 'offers-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  InitFormDefaultValues(): void {
    const dateStr = HelperFunctions.GenerateTodayFormFieldDateString();

    this.filterForm.controls['OfferIssueDateFrom'].setValue(dateStr);
    this.filterForm.controls['OfferIssueDateTo'].setValue(dateStr);
    this.filterForm.controls['OfferVaidityDateForm'].setValue(dateStr);
    this.filterForm.controls['OfferVaidityDateTo'].setValue(dateStr);
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.filterForm = new FormGroup({
      OfferNumber: new FormControl(undefined, []),

      CustomerSearch: new FormControl(undefined, []),

      CustomerName: new FormControl(undefined, []),

      OfferIssueDateFrom: new FormControl(undefined, []),
      OfferIssueDateTo: new FormControl(undefined, []),

      OfferVaidityDateForm: new FormControl(undefined, []),
      OfferVaidityDateTo: new FormControl(undefined, []),
    });

    this.InitFormDefaultValues();

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
      'Offer',
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
        return {} as Offer;
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

  override Refresh(params?: GetOffersParamsModel): void {
    console.log('Refreshing: ', params); // TODO: only for debug
    this.isLoading = true;
    this.seC.GetAllCountryCodes().subscribe({
      next: (data) => {
        if (!!data) this.countryCodes = data;
      },
      error: (err) => {
        this.cs.HandleError(err);
      }
    });
    this.offerService.GetAll(params).subscribe({
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

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.dbDataTable.GenerateAndSetNavMatrices(false);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private RefreshAll(params?: GetOffersParamsModel): void {
    this.Refresh(params);
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.filterFormNav!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.MoveRight();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  IsNumber(val: string): boolean {
    let val2 = val.replace(' ', '');
    return !isNaN(parseFloat(val2));
  }

  private PrepareCustomer(data: Customer): Customer {
    console.log('Before: ', data);

    data.customerBankAccountNumber = data.customerBankAccountNumber ?? '';
    data.taxpayerNumber = (data.taxpayerId + (data.countyCode ?? '')) ?? '';

    if (data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.seC.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
      next: res => {
        if (!!res && !!res.data && !!res.data.customerName && res.data.customerName.length > 0) {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);

          const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
            context: {
              data: this.PrepareCustomer(res.data)
            },
            closeOnEsc: false
          });
          dialogRef.onClose.subscribe({
            next: (res: Customer) => {
              console.log("Selected item: ", res);
              if (!!res) {
                this.buyerData = res;
                this.filterForm.controls["CustomerName"].setValue(res.customerName);

                this.kbS.SetCurrentNavigatable(this.filterFormNav);
                this.kbS.SelectFirstTile();
                this.kbS.setEditMode(KeyboardModes.EDIT);
              }
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.toastrService.show(res.errors?.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        }
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    this.customerInputFilterString = event.target.value ?? '';
    this.isLoading = true;
    this.seC.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString
    } as GetCustomersParamListModel).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.filterForm.controls["CustomerName"].setValue(res.data[0].customerName);
          this.searchByTaxtNumber = false;
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            this.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.filterForm.controls["CustomerName"].setValue('');
        }
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
        this.searchByTaxtNumber = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}