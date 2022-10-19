import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
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
import { IframeViewerDialogComponent } from '../../shared/iframe-viewer-dialog/iframe-viewer-dialog.component';
import { InfrastructureService } from '../../infrastructure/services/infrastructure.service';
import { SendEmailRequest } from '../../infrastructure/models/Email';
import { UtilityService } from 'src/app/services/utility.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { DeleteOfferRequest } from '../models/DeleteOfferRequest';
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { todaysDate, validDate } from 'src/assets/model/Validators';
import { lastValueFrom, Subscription } from 'rxjs';
import { TokenStorageService } from '../../auth/services/token-storage.service';

@Component({
  selector: 'app-offer-nav',
  templateUrl: './offer-nav.component.html',
  styleUrls: ['./offer-nav.component.scss']
})
export class OfferNavComponent extends BaseNoFormManagerComponent<Offer> implements IFunctionHandler, IInlineManager, OnInit, AfterViewInit {
  @ViewChild('table') table?: NbTable<any>;

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

  /*
{
      label: 'Elad ár 2',
      objectKey: 'unitPrice2',
      colKey: 'unitPrice2',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: false,
      mask: '',
      colWidth: '130px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
  */

  get CustomerId(): number | undefined {
    if (!!this.buyerData && this.buyerData.id > -1) {
      return this.buyerData.id;
    } else {
      return undefined
    }
  }

  override get getInputParams(): GetOffersParamsModel {
    let issueFrom = this.filterForm.controls['OfferIssueDateFrom'].value ?? "";
    let issueTo = this.filterForm.controls['OfferIssueDateTo'].value ?? "";
    let vaidityFrom = this.filterForm.controls['OfferVaidityDateForm'].value ?? "";
    let vaidityTo = this.filterForm.controls['OfferVaidityDateTo'].value ?? "";
    
    return {
      PageNumber: this.dbDataTable.currentPage,
      PageSize: parseInt(this.dbDataTable.pageSize),

      OfferNumber: this.filterForm.controls['OfferNumber'].value,

      CustomerID: this.CustomerId,
      
      OfferIssueDateFrom: issueFrom.length > 0 ? issueFrom : undefined,
      OfferIssueDateTo: issueTo.length > 0 ? issueTo : undefined,

      OfferVaidityDateForm: vaidityFrom.length > 0 ? vaidityFrom : undefined,
      OfferVaidityDateTo: vaidityTo.length > 0 ? vaidityTo : undefined,
    };
  }

  filterFormId = 'offers-filter-form';
  filterForm!: FormGroup;
  filterFormNav!: FlatDesignNoTableNavigatableForm;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
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
    const tmp = this.filterForm.controls['OfferVaidityDateForm'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }
  get invoiceOfferVaidityDateTo(): Date | undefined {
    if (!!!this.filterForm) {
      return undefined;
    }
    const tmp = this.filterForm.controls['OfferVaidityDateTo'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  get IsTableActive(): boolean {
    return this.kbS.IsCurrentNavigatable(this.dbDataTable);
  }

  isPageReady: boolean = false;

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Offer>>,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private offerService: OfferService,
    private seC: CustomerService,
    cs: CommonService,
    sts: StatusService,
    private router: Router,
    private infrastructureService: InfrastructureService,
    private utS: UtilityService,
    private tokenService: TokenStorageService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);

    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'offers-table';
    this.dbDataTableEditId = 'offers-cell-edit-input';

    this.kbS.ResetToRoot();

    this.Setup();
  }

  InitFormDefaultValues(): void {
    this.filterForm.controls['OfferIssueDateFrom'].setValue(HelperFunctions.GetDateString(0, -4));
    this.filterForm.controls['OfferIssueDateTo'].setValue(HelperFunctions.GetDateString());
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
    if (!HelperFunctions.IsDateStringValid(control.value) || this.invoiceOfferIssueDateFrom === undefined) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v < this.invoiceOfferIssueDateFrom;
    
    return wrong ? { minDate: { value: control.value } } : null;
  }

  validateOfferValidityDateFrom(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || this.invoiceOfferVaidityDateTo === undefined) {
      return null;
    }

    let v = new Date(control.value);
    let wrong = v > this.invoiceOfferVaidityDateTo;
    
    return wrong ? { maxDate: { value: control.value } } : null;
  }
  validateOfferValidityDateTo(control: AbstractControl): any {
    if (!HelperFunctions.IsDateStringValid(control.value) || this.invoiceOfferValidityDateFrom === undefined) {
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

    this.filterForm = new FormGroup({
      OfferNumber: new FormControl(undefined, []),

      CustomerSearch: new FormControl(undefined, []),

      CustomerName: new FormControl(undefined, []),
      CustomerAddress: new FormControl(undefined, []),
      CustomerTaxNumber: new FormControl(undefined, []),

      OfferIssueDateFrom: new FormControl(undefined, [
        validDate,
        this.validateOfferIssueDateFrom.bind(this),
      ]),
      OfferIssueDateTo: new FormControl(undefined, [
        validDate,
        this.validateOfferIssueDateTo.bind(this),
      ]),

      OfferVaidityDateForm: new FormControl(undefined, [
        validDate,
        this.validateOfferValidityDateFrom.bind(this),
      ]),
      OfferVaidityDateTo: new FormControl(undefined, [
        validDate,
        this.validateOfferValidityDateTo.bind(this),
      ]),
    });

    this.filterForm.controls['OfferIssueDateFrom'].valueChanges.subscribe({
      next: newValue => {
        console.log('OfferIssueDateFrom value changed: ', newValue);
        if (!this.filterForm.controls['OfferIssueDateTo'].valid && this.filterForm.controls['OfferIssueDateFrom'].valid) {
          this.filterForm.controls['OfferIssueDateTo'].setValue(this.filterForm.controls['OfferIssueDateTo'].value);
        }
      }
    });

    this.filterForm.controls['OfferIssueDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('OfferIssueDateTo value changed: ', newValue);
        if (!this.filterForm.controls['OfferIssueDateFrom'].valid && this.filterForm.controls['OfferIssueDateTo'].valid) {
          this.filterForm.controls['OfferIssueDateFrom'].setValue(this.filterForm.controls['OfferIssueDateFrom'].value);
        }
      }
    });

    this.filterForm.controls['OfferVaidityDateForm'].valueChanges.subscribe({
      next: newValue => {
        console.log('OfferVaidityDateForm value changed: ', newValue);
        if (!this.filterForm.controls['OfferVaidityDateTo'].valid && this.filterForm.controls['OfferVaidityDateForm'].valid) {
          this.filterForm.controls['OfferVaidityDateTo'].setValue(this.filterForm.controls['OfferVaidityDateTo'].value);
        }
      }
    });

    this.filterForm.controls['OfferVaidityDateTo'].valueChanges.subscribe({
      next: newValue => {
        console.log('OfferVaidityDateTo value changed: ', newValue);
        if (!this.filterForm.controls['OfferVaidityDateForm'].valid && this.filterForm.controls['OfferVaidityDateTo'].valid) {
          this.filterForm.controls['OfferVaidityDateForm'].setValue(this.filterForm.controls['OfferVaidityDateForm'].value);
        }
        this.filterForm.controls['OfferVaidityDateForm'].markAsDirty();
        this.cdref.detectChanges();
      }
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

  public RefreshAndJumpToTable(): void {
    this.Refresh(this.getInputParams, true);
  }

  JumpToFirstCellAndNav(): void {
    console.log("[JumpToFirstCellAndNav]");
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.kbS.SetCurrentNavigatable(this.dbDataTable);
    this.kbS.SelectElementByCoordinate(0, 0);
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
          this.RefreshTable(undefined, this.isPageReady);
          if (this.isPageReady) {
            this.JumpToFirstCellAndNav();
          }
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

  ngOnInit(): void {
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
    data.taxpayerNumber = (data.taxpayerId + (data.countyCode ?? '')) ?? '';

    const countryCodes = await lastValueFrom(this.seC.GetAllCountryCodes());

    if (!!countryCodes && countryCodes.length > 0 && data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode = this.countryCodes.find(x => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  ChoseDataForFormByTaxtNumber(): void {
    debugger;
    console.log("Selecting Customer from avaiable data by taxtnumber.");

    this.isLoading = true;

    this.seC.GetByTaxNumber({ Taxnumber: this.customerInputFilterString } as GetCustomerByTaxNumberParams).subscribe({
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
      return;
    }

    this.isLoading = true;
    this.Subscription_FillFormWithFirstAvailableCustomer = this.seC.GetAll({
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString
    } as GetCustomersParamListModel).subscribe({
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
        this.cs.HandleError(err); this.isLoading = false;
        this.searchByTaxtNumber = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ChooseDataForTableRow(rowIndex: number): void {}
  
  ChooseDataForForm(): void {
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
      case this.KeySetting[Actions.CrudNew].KeyCode:
        this.Create();
        break;
      // EDIT
      case this.KeySetting[Actions.CrudEdit].KeyCode:
        this.Edit();
        break;
      // DELETE
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
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
      const id = this.dbData[this.kbS.p.y - 1].data.id;

      this.sts.pushProcessStatus(Constants.DownloadReportStatuses[Constants.DownloadOfferNavCSVProcessPhases.PROC_CMD]);
      this.utS.execute(Constants.CommandType.DOWNLOAD_OFFER_NAV_CSV, Constants.FileExtensions.CSV,
        {
          "ID": HelperFunctions.ToFloat(id),
          "data_operation": Constants.DataOperation.DOWNLOAD_BLOB,
        } as Constants.Dct);
    }
  }

  SendEmail(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y - 1].data.id;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      const user = this.tokenService.user;

      const dialogRef = this.dialogService.open(SendEmailDialogComponent, {
        context: {
          subject: `RELAX árajánlat ${HelperFunctions.GetDateStringFromDate(this.dbData[this.kbS.p.y - 1].data.offerIssueDate)}`,
          message: this.dbData[this.kbS.p.y - 1].data.notice,
          OfferID: this.dbData[this.kbS.p.y - 1].data.id,
          DefaultFrom: user?.email,
          DefaultTo: this.buyerData?.email,
          UserName: user?.name
        },
        closeOnEsc: false,
        closeOnBackdropClick: false
      });
      dialogRef.onClose.subscribe(async (res?: SendEmailRequest) => {
        console.log(`[SendEmail]: to send: ${res}`);
        if (!!res) {

          // seC
          if (!!this.buyerData?.email && !!(this.buyerData.email.trim()) && res.to.email !== this.buyerData.email) {
            this.buyerData.email = res.to.email;
            const updateRes = await lastValueFrom(this.seC.Update(this.buyerData));
            if (updateRes && updateRes.succeeded) {
              this.simpleToastrService.show(
                Constants.MSG_EMAIL_CUSTOMER_UPDATE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
            } else {
              this.bbxToastrService.show(
                Constants.MSG_EMAIL_CUSTOMER_UPDATE_FAILED,
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            }
          }

          this.isLoading = true;
          this.infrastructureService.SendEmail(res).subscribe({
            next: _ => {
              this.simpleToastrService.show(
                Constants.MSG_EMAIL_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
            },
            error: (err) => {
              this.cs.HandleError(err);
              this.isLoading = false;
            },
            complete: () => {
              this.isLoading = false;

              this.kbS.SetCurrentNavigatable(this.filterFormNav);
              this.kbS.SelectFirstTile();
              this.kbS.setEditMode(KeyboardModes.EDIT);
            },  
          });
        }
      });
    }
  }

  ViewNotice(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y - 1].data.id;

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
      const id = this.dbData[this.kbS.p.y - 1].data.id;
      this.router.navigate(['product/offers-edit', id, {}]);
    }
  }

  Delete(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y - 1].data.id;

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
                this.Refresh(this.getInputParams);
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

  Print(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const rowIndex = this.kbS.p.y - 1; 
      const id = this.dbData[this.kbS.p.y - 1].data.id;

      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      const dialogRef = this.dialogService.open(OneTextInputDialogComponent, {
        context: {
          title: 'Ajánlat Nyomtatása',
          inputLabel: 'Példányszám',
          defaultValue: 1
        }
      });
      dialogRef.onClose.subscribe({
        next: async res => {
          if (res.answer && HelperFunctions.ToInt(res.value) > 0) {
            this.isLoading = true;

            let commandEndedSubscription = this.utS.CommandEnded.subscribe({
              next: cmdEnded => {
                console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

                if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
                  this.simpleToastrService.show(
                    `Az árajánlat nyomtatása véget ért.`,
                    Constants.TITLE_INFO,
                    Constants.TOASTR_SUCCESS_5_SEC
                  );
                  commandEndedSubscription.unsubscribe();
                }
                this.isLoading = false;
              },
              error: cmdEnded => {
                console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

                commandEndedSubscription.unsubscribe();
                this.bbxToastrService.show(
                  `Az árajánlat nyomtatása közben hiba történt.`,
                  Constants.TITLE_ERROR,
                  Constants.TOASTR_ERROR
                );
                this.isLoading = false;
              }
            });

            await this.printReport(id, res.value);

            const updatedOffer = await this.GetOffer(id);
            if (updatedOffer) {
              this.dbData[rowIndex].data.copies = updatedOffer.copies;
            }
          } else {
            this.simpleToastrService.show(
              `Az árajánlat számla nyomtatása nem történt meg.`,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            this.isLoading = false;
          }
        }
      });
    }
  }

  private async GetOffer(id: number): Promise<Offer> {
    const offerRes = lastValueFrom(this.offerService.Get({ ID: id, FullData: true }));
    return offerRes;
  }

  async printReport(id: any, copies: number): Promise<void> {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
    let params = {
      "section": "Szamla",
      "fileType": "pdf",
      "report_params":
      {
        "id": id,
        "offerNumber": null
      },
      "copies": copies,
      "data_operation": Constants.DataOperation.PRINT_BLOB,
      "blob_data": null
    } as Constants.Dct;
    params["blob_data"] = await lastValueFrom(this.offerService.GetReport(params));
    this.utS.execute(Constants.CommandType.PRINT_OFFER, Constants.FileExtensions.PDF, params);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.filterFormNav?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
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
        this.SendEmail();
        return;
      // View Notice
      case this.KeySetting[Actions.Details].KeyCode:
        event.preventDefault();
        this.ViewNotice();
        return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.CSV].KeyCode:
      case this.KeySetting[Actions.Email].KeyCode:
      case this.KeySetting[Actions.Details].KeyCode:
      case this.KeySetting[Actions.CrudNew].KeyCode:
      case this.KeySetting[Actions.CrudEdit].KeyCode:
      case this.KeySetting[Actions.CrudReset].KeyCode:
      case this.KeySetting[Actions.CrudSave].KeyCode:
      case this.KeySetting[Actions.CrudDelete].KeyCode:
      case this.KeySetting[Actions.CrudDelete].AlternativeKeyCode:
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