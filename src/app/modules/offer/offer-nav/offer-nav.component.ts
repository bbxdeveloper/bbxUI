import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
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
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { CustomerSelectTableDialogComponent } from '../../invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { Actions, OfferNavKeySettings, KeyBindings, GetFooterCommandListFromKeySettings } from 'src/assets/util/KeyBindings';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { Router } from '@angular/router';
import { SendEmailDialogComponent } from '../../infrastructure/send-email-dialog/send-email-dialog.component';
import { IframeViewerDialogComponent } from '../../shared/simple-dialogs/iframe-viewer-dialog/iframe-viewer-dialog.component';
import { InfrastructureService } from '../../infrastructure/services/infrastructure.service';
import { SendEmailRequest } from '../../infrastructure/models/Email';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { ConfirmationDialogComponent } from '../../shared/simple-dialogs/confirmation-dialog/confirmation-dialog.component';
import { DeleteOfferRequest } from '../models/DeleteOfferRequest';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { validDate } from 'src/assets/model/Validators';
import { firstValueFrom, lastValueFrom, Subscription } from 'rxjs';
import { TokenStorageService } from '../../auth/services/token-storage.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OfferFilter } from '../models/OfferFilter';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';

export interface OfferPrintParams {
  rowIndex: number,
  id: number,
  dbData: any,
  dbDataTable: any,
}

@Component({
  selector: 'app-offer-nav',
  templateUrl: './offer-nav.component.html',
  styleUrls: ['./offer-nav.component.scss']
})
export class OfferNavComponent extends BaseNoFormManagerComponent<Offer> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

  private readonly localStorageKey: string

  private Subscription_FillFormWithFirstAvailableCustomer?: Subscription;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  readonly SearchButtonId: string = 'offers-button-search';
  IsTableFocused: boolean = false;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  readonly ChosenIssueFilterOptionValue: string = '1';
  readonly ChosenDeliveryFilterOptionValue: string = '2';

  customerInputFilterString: string = '';

  isDeleteDisabled: boolean = false;

  cachedCustomerName?: string;
  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.filterFormNav.GenerateAndSetNavMatrices(false, true);
    this.AddSearchButtonToFormMatrix();
  }
  buyerData!: Customer;
  buyersData: Customer[] = [];

  override allColumns = [
    'offerNumberX',
    'customerName',
    'offerIssueDate',
    'offerVaidityDate',
    'copies',
    'sumNetAmount',
    'sumBrtAmount',
    'notice',
    'currencyCodeX'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Sorszám',
      objectKey: 'offerNumberX',
      colKey: 'offerNumberX',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
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
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kelt.',
      objectKey: 'offerIssueDate',
      colKey: 'offerIssueDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Érv.',
      objectKey: 'offerVaidityDate',
      colKey: 'offerVaidityDate',
      defaultValue: '',
      type: 'onlyDate',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Ny.',
      objectKey: 'copies',
      colKey: 'copies',
      defaultValue: '',
      type: 'number-3-length',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '60px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Nettó össz', objectKey: 'sumNetAmount', colKey: 'sumNetAmount',
      defaultValue: '', mask: "", fReadonly: true,
      colWidth: "130px", textAlign: "right", type: 'formatted-number'
    },
    {
      label: 'Bruttó össz', objectKey: 'sumBrtAmount', colKey: 'sumBrtAmount',
      defaultValue: '', mask: "",
      colWidth: "130px", textAlign: "right", type: 'formatted-number'
    },
    {
      label: 'P.N.',
      objectKey: 'currencyCodeX',
      colKey: 'currencyCodeX',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '60px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'html',
      fInputType: 'text',
      fRequired: false,
      mask: '',
      colWidth: '70%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  get CustomerId(): number | undefined {
    if (!!this.buyerData && this.buyerData.id > -1) {
      return this.buyerData.id;
    } else {
      return undefined
    }
  }

  public override getInputParams(override?: Constants.Dct): GetOffersParamsModel {
    const issueFrom = this.filterForm.controls['OfferIssueDateFrom'].value ?? "";
    const issueTo = this.filterForm.controls['OfferIssueDateTo'].value ?? "";
    const vaidityFrom = this.filterForm.controls['OfferValidityDateForm'].value ?? "";
    const vaidityTo = this.filterForm.controls['OfferValidityDateTo'].value ?? "";

    const params = {
      PageNumber: 1,
      PageSize: parseInt(this.dbDataTable.pageSize),

      OfferNumber: this.filterForm.controls['OfferNumber'].value,

      CustomerID: this.CustomerId,

      OfferIssueDateFrom: issueFrom.length > 0 ? issueFrom : undefined,
      OfferIssueDateTo: issueTo.length > 0 ? issueTo : undefined,

      OfferValidityDateForm: vaidityFrom.length > 0 ? vaidityFrom : undefined,
      OfferValidityDateTo: vaidityTo.length > 0 ? vaidityTo : undefined,
    }

    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"]
    }

    return params
  }

  filterFormId = 'offers-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  public KeySetting: Constants.KeySettingsDct = OfferNavKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  get invoiceOfferIssueDateFrom(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferIssueDateFrom'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceOfferIssueDateTo(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferIssueDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get invoiceOfferValidityDateFrom(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferValidityDateForm'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  get OfferValidityDateTo(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferValidityDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  isPageReady: boolean = false;

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Offer>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private offerService: OfferService,
    private customerService: CustomerService,
    cs: CommonService,
    sts: StatusService,
    private router: Router,
    private infrastructureService: InfrastructureService,
    private printAndDownLoadService: PrintAndDownloadService,
    private tokenService: TokenStorageService,
    private khs: KeyboardHelperService,
    private readonly localStorage: LocalStorageService,
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'offers-table';
    this.dbDataTableEditId = 'offers-cell-edit-input';

    this.localStorageKey = 'OfferNav.' + this.tokenService.user?.id ?? 'everyone'

    this.kbS.ResetToRoot();

    this.Setup();
  }

  ToInt(p: any): number {
    return parseInt(p + '');
  }

  validateOfferIssueDateFrom(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || this.invoiceOfferIssueDateTo === undefined) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v > this.invoiceOfferIssueDateTo;

    return wrong ? { maxDate: { value: control.value } } : null;
  }

  validateOfferIssueDateTo(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || !this.invoiceOfferIssueDateFrom) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v < this.invoiceOfferIssueDateFrom;

    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateOfferValidityDateFrom(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || !this.OfferValidityDateTo) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v > this.OfferValidityDateTo;

    return wrong ? { maxDate: { value: control.value } } : null;
  }

  validateOfferValidityDateTo(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || !this.invoiceOfferValidityDateFrom) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v < this.invoiceOfferValidityDateFrom;

    return wrong ? { minDate: { value: control.value } } : null;
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({});

    this.setupFilterForm()

    this.filterFormNav = new FlatDesignNoTableNavigatableForm(
      this.filterForm,
      this.kbS,
      this.cdref, [], this.filterFormId,
      AttachDirection.DOWN,
      this.colDefs,
      this.sidebarService,
      this.fS,
      this.dbDataTable,
      this
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
      },
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });

    this.filterFormNav!.OuterJump = true;
    this.dbDataTable!.OuterJump = true;
  }

  private setupFilterForm(): void {
    let filterData = this.localStorage.get<OfferFilter>(this.localStorageKey)

    if (!filterData || filterData.customerSearch === '') {
      filterData = OfferFilter.create()
    }

    this.filterForm = new FormGroup({
      OfferNumber: new FormControl(filterData.offerNumber, []),

      CustomerSearch: new FormControl(filterData.customerSearch, []),

      CustomerName: new FormControl(filterData.customerName, []),
      CustomerAddress: new FormControl(filterData.customerAddress, []),
      CustomerTaxNumber: new FormControl(filterData.customerTaxNumber, []),

      OfferIssueDateFrom: new FormControl(filterData.offerIssueDateFrom, [
        validDate,
        this.validateOfferIssueDateFrom.bind(this),
      ]),
      OfferIssueDateTo: new FormControl(filterData.offerIssueDateTo, [
        validDate,
        this.validateOfferIssueDateTo.bind(this),
      ]),

      OfferValidityDateForm: new FormControl(filterData.offerValidityDateFrom, [
        validDate,
        this.validateOfferValidityDateFrom.bind(this),
      ]),
      OfferValidityDateTo: new FormControl(filterData.offerValidityDateTo, [
        validDate,
        this.validateOfferValidityDateTo.bind(this),
      ]),
    });

    this.filterForm.valueChanges.subscribe(value => {
      if (value.CustomerSearch === '') {
        value.CustomerName = ''
        value.CustomerAddress = ''
        value.CustomerTaxNumber = ''

        this.localStorage.remove(this.localStorageKey)
      }

      const filterData = {
        offerNumber: value.OfferNumber,
        customerSearch: value.CustomerSearch,
        customerName: value.CustomerName,
        customerAddress: value.CustomerAddress,
        customerTaxNumber: value.CustomerTaxNumber,
        offerIssueDateFrom: value.OfferIssueDateFrom,
        offerIssueDateTo: value.OfferIssueDateTo,
        offerValidityDateFrom: value.OfferValidityDateForm,
        offerValidityDateTo: value.OfferValidityDateTo,
      } as OfferFilter

      this.localStorage.put(this.localStorageKey, filterData)
    })

    this.filterForm.controls['OfferIssueDateFrom'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['OfferIssueDateTo'].valid && this.filterForm.controls['OfferIssueDateFrom'].valid) {
          this.filterForm.controls['OfferIssueDateTo'].setValue(this.filterForm.controls['OfferIssueDateTo'].value);
        }
      }
    });

    this.filterForm.controls['OfferIssueDateTo'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['OfferIssueDateFrom'].valid && this.filterForm.controls['OfferIssueDateTo'].valid) {
          this.filterForm.controls['OfferIssueDateFrom'].setValue(this.filterForm.controls['OfferIssueDateFrom'].value);
        }
      }
    });

    this.filterForm.controls['OfferValidityDateForm'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['OfferValidityDateTo'].valid && this.filterForm.controls['OfferValidityDateForm'].valid) {
          this.filterForm.controls['OfferValidityDateTo'].setValue(this.filterForm.controls['OfferValidityDateTo'].value);
        }
      }
    });

    this.filterForm.controls['OfferValidityDateTo'].valueChanges.subscribe({
      next: newValue => {
        if (!this.filterForm.controls['OfferValidityDateForm'].valid && this.filterForm.controls['OfferValidityDateTo'].valid) {
          this.filterForm.controls['OfferValidityDateForm'].setValue(this.filterForm.controls['OfferValidityDateForm'].value);
        }
        this.filterForm.controls['OfferValidityDateForm'].markAsDirty();
        this.cdref.detectChanges();
      }
    });
  }

  public RefreshAndJumpToTable(): void {
    this.Refresh(this.getInputParams(), true);
  }

  JumpToTable(x: number = 0, y: number = 0): void {
    console.log("[JumpToFirstCellAndNav]");
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(x, y);
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    setTimeout(() => {
      this.kbS.MoveDown();
    }, 300);
  }

  override Refresh(params?: GetOffersParamsModel, jumpToFirstTableCell: boolean = false): void {
    console.log('Refreshing: ', params); // TODO: only for debug
    this.isLoading = true;
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
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable(undefined, true);
        } else {
          this.bbxToastrService.show(
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
        if (!this.isPageReady) {
          this.isPageReady = true;
        }
      },
    });
  }

  async RefreshAsync(params?: GetOffersParamsModel, jumpToFirstTableCell: boolean = false) {
    console.log('Refreshing: ', params); // TODO: only for debug
    this.isLoading = true;
    await lastValueFrom(this.offerService.GetAll(params))
      .then(getAllResult => {
        if (getAllResult.succeeded && getAllResult.data) {
          console.log('GetProducts response: ', getAllResult); // TODO: only for debug
          if (!!getAllResult) {
            const tempData = getAllResult.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(getAllResult);
          }
          this.RefreshTable(undefined, this.isPageReady);
          if (this.isPageReady) {
            this.JumpToTable();
          }
        } else if (getAllResult.errors) {
          this.bbxToastrService.show(
            getAllResult.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
      })
      .finally(() => {});
    this.isLoading = false;
  }

  public async ngOnInit(): Promise<void> {
    const filterData = this.localStorage.get<OfferFilter>(this.localStorageKey)
    if (filterData && filterData.customerSearch !== '') {
      await this.searchCustomerAsync(this.filterForm.controls['CustomerSearch'].value)

      await this.RefreshAsync(this.getInputParams())

      if (this.dbData.length === 0) {
        this.kbS.SetCurrentNavigatable(this.filterFormNav)
        this.kbS.SelectFirstTile()
        this.kbS.setEditMode(KeyboardModes.EDIT)
      }
      else {
        const offerNumber = this.filterForm.controls['OfferNumber'].value
        if (offerNumber !== '') {
          const index = this.dbData.findIndex(x => x.data.offerNumber === offerNumber)

          this.JumpToTable(index, 0)
        }
        else {
          this.JumpToTable()
        }
      }
    }
    else {
      this.RefreshAll(this.getInputParams())
    }

    this.fS.pushCommands(this.commands);
  }

  ngAfterViewInit(): void {
    console.log("[ngAfterViewInit]");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.filterFormNav.GenerateAndSetNavMatrices(true, true, NavMatrixOrientation.ONLY_HORIZONTAL);
    this.AddSearchButtonToFormMatrix();
    console.log(this.filterFormNav.Matrix);

    this.dbDataTable.GenerateAndSetNavMatrices(true, undefined, false);
    this.dbDataTable.DisableFooter = true;

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.filterFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);
    }, 200);
  }

  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private AddSearchButtonToFormMatrix(): void {
    this.filterFormNav.Matrix[this.filterFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  private RefreshAll(params?: GetOffersParamsModel): void {
    this.Refresh(params);
  }

  public resetFilter(): void {
    this.localStorage.remove(this.localStorageKey)
    this.filterForm.reset()
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.filterFormNav!.HandleFormEnter(event, true, true, true);
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

  private async PrepareCustomer(data: Customer): Promise<Customer> {
    console.log('Before: ', data);

    data.customerBankAccountNumber = data.customerBankAccountNumber ?? '';
    data.taxpayerNumber = `${data.taxpayerId}-${data.vatCode ?? ''}-${data.countyCode ?? ''}`

    const countryCodes = await lastValueFrom(this.customerService.GetAllCountryCodes());

    if (!!countryCodes && countryCodes.length > 0 && data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  ChoseDataForFormByTaxtNumber(): void {
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.customerService.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
      next: async res => {
        if (!!res && !!res.data && !!res.data.customerName && res.data.customerName.length > 0) {
          this.kbS.setEditMode(KeyboardModes.NAVIGATION);

          const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
            context: {
              data: await this.PrepareCustomer(res.data)
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
          this.bbxToastrService.show(res.errors?.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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

  private SetCustomerFormFields(data?: Customer) {
    if (data === undefined) {
      this.filterForm.controls['CustomerName'].setValue(undefined);
      this.filterForm.controls['CustomerAddress'].setValue(undefined);
      this.filterForm.controls['CustomerTaxNumber'].setValue(undefined);
      return;
    }
    this.filterForm.controls['CustomerName'].setValue(data.customerName);
    this.filterForm.controls['CustomerAddress'].setValue(data.postalCode + ', ' + data.city);
    this.filterForm.controls['CustomerTaxNumber'].setValue(data.taxpayerNumber);
  }

  FillFormWithFirstAvailableCustomer(event: any): void {
    if (!!this.Subscription_FillFormWithFirstAvailableCustomer && !this.Subscription_FillFormWithFirstAvailableCustomer.closed) {
      this.Subscription_FillFormWithFirstAvailableCustomer.unsubscribe();
    }

    this.customerInputFilterString = event.target.value ?? '';

    if (this.customerInputFilterString.replace(' ', '') === '') {
      this.buyerData = { id: -1 } as Customer;
      this.SetCustomerFormFields(undefined);
      this.isLoading = false
      return;
    }

    this.isLoading = true;
    this.Subscription_FillFormWithFirstAvailableCustomer = this.searchCustomer(this.customerInputFilterString)
  }

  private searchCustomer(term: string): Subscription {
    const request = {
      IsOwnData: false,
      PageNumber: '1',
      PageSize: '1',
      SearchString: term,
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    return this.customerService.GetAll(request).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.SetCustomerFormFields(res.data[0]);
          this.searchByTaxtNumber = false;
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            this.IsNumber(this.customerInputFilterString)) {
            this.searchByTaxtNumber = true;
          } else {
            this.searchByTaxtNumber = false;
          }
          this.SetCustomerFormFields(undefined);
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.searchByTaxtNumber = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private async searchCustomerAsync(term: string): Promise<void> {
    const request = {
      IsOwnData: false,
      PageNumber: '1',
      PageSize: '1',
      SearchString: term,
      OrderBy: 'customerName'
    } as GetCustomersParamListModel

    try {
      const res = await firstValueFrom(this.customerService.GetAll(request))

      if (!!res && res.data !== undefined && res.data.length > 0) {
        this.buyerData = res.data[0];
        this.cachedCustomerName = res.data[0].customerName;
        this.SetCustomerFormFields(res.data[0]);
        this.searchByTaxtNumber = false;
      } else {
        if (this.customerInputFilterString.length >= 8 &&
          this.IsNumber(this.customerInputFilterString)) {
          this.searchByTaxtNumber = true;
        } else {
          this.searchByTaxtNumber = false;
        }
        this.SetCustomerFormFields(undefined);
      }
    }
    catch (error) {
      this.cs.HandleError(error);
      this.isLoading = false;
      this.searchByTaxtNumber = false;
    }
  }

  ChooseDataForTableRow(rowIndex: number): void {}

  ChooseDataForCustomerForm(): void {
    console.log("Selecting Customer from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        searchString: this.customerInputFilterString,
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe((res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
        this.buyerData = res;
        this.SetCustomerFormFields(res);

        this.kbS.SetCurrentNavigatable(this.filterFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);
      }
    });
  }

  RefreshData(): void {}
  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {}
  RecalcNetAndVat(): void { }

  HandleFunctionKey(event: Event | KeyBindings): void {
    const val = event instanceof Event ? (event as KeyboardEvent).code : event;
    console.log(`[HandleFunctionKey]: ${val}`);
    switch (val) {
      // CSV
      case this.KeySetting[Actions.CSV].KeyCode:
        this.DownLoadCSV();
        break;
      // Send Email
      case this.KeySetting[Actions.Email].KeyCode:
        this.SendEmail();
        break;
      // View Notice
      case this.KeySetting[Actions.Details].KeyCode:
        this.ViewNotice();
        break;
      // NEW
      case this.KeySetting[Actions.Create].KeyCode:
        this.Create();
        break;
      // EDIT
      case this.KeySetting[Actions.Edit].KeyCode:
        this.Edit();
        break;
      // DELETE
      case this.KeySetting[Actions.Delete].KeyCode:
        if (!this.isDeleteDisabled) {
          this.Delete();
        }
        break;
      // PRINT
      case this.KeySetting[Actions.Print].KeyCode:
        this.Print();
        break;
    }
  }

  DownLoadCSV(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y].data.id;

      this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD]);
      this.printAndDownLoadService.downloadCsvOrXml(
        {
          "report_params":
          {
            "ID": HelperFunctions.ToFloat(id)
          }
        } as Constants.Dct,
        this.offerService.GetCsv.bind(this.offerService)
      );
    }
  }

  async SendEmail() {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const selectedData = this.dbData[this.kbS.p.y].data;
      const selectedColumnIndex = this.kbS.p.x;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      const user = this.tokenService.user;

      let offerCustomer: Customer;
      if (!this.buyerData) {
        offerCustomer = await this.GetCustomer(selectedData.customerID);
      } else {
        offerCustomer = this.buyerData;
      }

      if (!offerCustomer) {
        this.bbxToastrService.showError(Constants.MSG_CUSTOMER_MISSING_OFFER_NAV);
        return;
      }

      // TODO: remove after fixing Email - email error
      const customerOriginalEmail = offerCustomer.email ?? offerCustomer.Email;

      const dialogRef = this.dialogService.open(SendEmailDialogComponent, {
        context: {
          subject: `RELAX árajánlat ${HelperFunctions.GetDateStringFromDate(selectedData.offerIssueDate)}`,
          message: selectedData.notice,
          OfferID: selectedData.id,
          DefaultFrom: user?.email,
          DefaultTo: customerOriginalEmail,
          DefaultToName: offerCustomer.customerName,
          DefaultFromName: user?.name,
          PrintParams: this.GeneratePrintParams()
        },
        closeOnEsc: false,
        closeOnBackdropClick: false
      });
      dialogRef.onClose.subscribe(async (res?: SendEmailRequest) => {
        console.log(`[SendEmail]: to send: ${res}`);
        if (!!res) {
          if (offerCustomer && (res.to.email !== customerOriginalEmail || res.to.name !== offerCustomer.customerName)) {
            this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

            offerCustomer.email = res.to.email;
            offerCustomer.customerName = res.to.name ?? offerCustomer.customerName;
            offerCustomer.taxpayerNumber = offerCustomer.taxpayerNumber?.substring(0, 13);

            await lastValueFrom(this.customerService.Update(offerCustomer))
              .then(async updateRes => {
                if (updateRes && updateRes.succeeded) {
                  this.simpleToastrService.show(
                    Constants.MSG_CUSTOMER_UPDATE_SUCCESFUL,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS_5_SEC
                  );
                  if (this.buyerData) {
                    this.buyerData.email = offerCustomer.email;
                    this.buyerData.customerName = offerCustomer.customerName;
                  }
                  await this.RefreshAsync(this.getInputParams());
                } else {
                  this.bbxToastrService.show(
                    Constants.MSG_CUSTOMER_UPDATE_FAILED,
                    Constants.TITLE_ERROR,
                    Constants.TOASTR_ERROR
                  );
                }
              })
              .catch(rejectReason => {
                this.cs.HandleError(rejectReason);
              })
              .finally(() => {});

            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }

          this.sts.pushProcessStatus(Constants.EmailStatuses[Constants.EmailPhases.SENDING]);

          await lastValueFrom(this.infrastructureService.SendEmail(res))
            .then(_ => {
              this.simpleToastrService.show(
                Constants.MSG_EMAIL_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
            })
            .catch(rejectReason => {
              this.cs.HandleError(rejectReason);
            })
            .finally(() => {
              this.kbS.SetCurrentNavigatable(this.filterFormNav);
              this.kbS.SelectFirstTile();
              this.kbS.setEditMode(KeyboardModes.EDIT);
            });

          if (selectedData.id !== undefined) {
            this.dbDataTable.SelectRowById(selectedData.id);
            this.kbS.SetPosition(selectedColumnIndex, this.kbS.p.y);
            this.kbS.ClickCurrentElement();
          }

          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      });
    }
  }

  ViewNotice(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y].data.id;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      const dialogRef = this.dialogService.open(IframeViewerDialogComponent, {
        context: {
          title: 'Megjegyzés Megtekintése',
          srcDoc: this.dbData.find(x => x.data.id === id)?.data.notice ?? '',
        }
      });
      dialogRef.onClose.subscribe((res: Customer) => {});
    }
  }

  Create(): void {
    this.router.navigate(['product/offers-create']);
  }

  Edit(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y].data.id;
      this.router.navigate(['product/offers-edit', id, {}]);
    }
  }

  Delete(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y].data.id;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      const confirmDialogRef = this.dialogService.open(ConfirmationDialogComponent, { context: { msg: Constants.MSG_CONFIRMATION_DELETE_OFFER } });
      confirmDialogRef.onClose.subscribe(res => {
        if (res) {
          this.isLoading = true;
          this.offerService.Delete({ ID: HelperFunctions.ToInt(id) } as DeleteOfferRequest).subscribe({
            next: res => {
              if (!!res && res.succeeded) {
                this.simpleToastrService.show(
                  Constants.MSG_DELETE_SUCCESFUL,
                  Constants.TITLE_INFO,
                  Constants.TOASTR_SUCCESS_5_SEC
                );
                this.Refresh(this.getInputParams());
              } else {
                this.cs.HandleError(res.errors);
                this.isLoading = false;
              }
            },
            error: (err) => {
              this.cs.HandleError(err);
              this.isLoading = false;
            },
            complete: () => {
              this.isLoading = false;
            },
          });
        }
      });
    }
  }

  protected GeneratePrintParams(): OfferPrintParams {
    return {
      rowIndex: this.kbS.p.y,
      id: this.dbData[this.kbS.p.y].data.id,
      dbData: this.dbData,
      dbDataTable: this.dbDataTable,
    } as OfferPrintParams;
  }

  Print(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y].data.id;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      this.printAndDownLoadService.openPrintDialog({
        DialogTitle: 'Ajánlat Nyomtatása',
        DefaultCopies: 1,
        MsgError: `Az árajánlat nyomtatása közben hiba történt.`,
        MsgCancel: `Az ajánlat nyomtatása nem történt meg.`,
        MsgFinish: `Az árajánlat nyomtatása véget ért.`,
        Obs: this.offerService.GetReport.bind(this.offerService),
        ReportParams: {
          "id": id,
          "copies": 1 // Ki lesz töltve dialog alapján
        } as Constants.Dct,
        Reset: () => { }
      } as PrintDialogRequest);
    }
  }


  private async GetCustomer(id: number): Promise<Customer> {
    const customerRes = lastValueFrom(this.customerService.Get({ ID: id }));
    return customerRes;
  }

  private toInvoice(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      HelperFunctions.confirm(this.dialogService, Constants.TITLE_OFFER_TO_INVOICE_CONFIRMATION, () => {
        const id = this.dbData[this.kbS.p.y].data.id
        this.router.navigate(['invoice/invoice'], {
          queryParams: {
            offerId: id
          }
        })
      })
    }
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) async onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event);
      return;
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      // CSV
      case this.KeySetting[Actions.CSV].KeyCode:
        event.preventDefault();
        this.DownLoadCSV();
        return;
      // Send Email
      case this.KeySetting[Actions.Email].KeyCode:
        event.preventDefault();
        await this.SendEmail();
        return;
      // View Notice
      case this.KeySetting[Actions.Details].KeyCode:
        event.preventDefault();
        this.ViewNotice();
        return;
      case this.KeySetting[Actions.ToggleForm].KeyCode:
        event.preventDefault();
        this.toInvoice();
        return;
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        return;
      }
    }
    switch (event.key) {
      case this.KeySetting[Actions.CSV].KeyCode:
      case this.KeySetting[Actions.Email].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
      case this.KeySetting[Actions.Create].KeyCode:
      case this.KeySetting[Actions.Edit].KeyCode:
      case this.KeySetting[Actions.Reset].KeyCode:
      case this.KeySetting[Actions.Save].KeyCode:
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.Print].KeyCode:
      case this.KeySetting[Actions.ToggleForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.HandleFunctionKey(event);
        break;
    }
  }
}