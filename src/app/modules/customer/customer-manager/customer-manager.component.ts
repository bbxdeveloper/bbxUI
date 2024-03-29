import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { BlankCustomer, Customer } from '../models/Customer';
import { CustomerService } from '../services/customer.service';
import { DeleteCustomerRequest } from '../models/DeleteCustomerRequest';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { GetCustomersParamListModel } from '../models/GetCustomersParamListModel';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { StatusService } from 'src/app/services/status.service';
import { CreateCustomerRequest } from '../models/CreateCustomerRequest';
import { UpdateCustomerRequest } from '../models/UpdateCustomerRequest';
import { CountryCode } from '../models/CountryCode';
import { lastValueFrom, ReplaySubject } from 'rxjs';
import { Actions, KeyBindings } from 'src/assets/util/KeyBindings';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { UnitPriceType, UnitPriceTypes } from '../models/UnitPriceType';
import { FormHelper } from 'src/assets/util/FormHelper';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { InvoiceService } from '../../invoice/services/invoice.service';
import { PaymentMethod } from '../../invoice/models/PaymentMethod';
import { LoggerService } from 'src/app/services/logger.service';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { GetCustomersResponse } from '../models/GetCustomersResponse';

@Component({
  selector: 'app-customer-manager',
  templateUrl: './customer-manager.component.html',
  styleUrls: ['./customer-manager.component.scss'],
})
export class CustomerManagerComponent extends BaseManagerComponent<Customer> implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('table') table?: NbTable<any>;

  override allColumns = [
    'id',
    'customerName',
    'taxpayerNumber',
    'postalCode',
    'city',
    'additionalAddressDetail',
    'thirdStateTaxId',
  ];
  allColumnsWithOpenedSideBar = [
    'id',
    'customerName',
    'taxpayerNumber',
    'thirdStateTaxId',
  ];

  AllColumns: ReplaySubject<string[]> = new ReplaySubject<string[]>();

  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Azonosító',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '120px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Név',
      objectKey: 'customerName',
      colKey: 'customerName',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Számlaszám',
      objectKey: 'customerBankAccountNumber',
      colKey: 'customerBankAccountNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: 'Set in sidebar form.',
      colWidth: '15%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Belföldi Adószám',
      objectKey: 'taxpayerNumber',
      colKey: 'taxpayerNumber',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '0000000-0-00',
      colWidth: '150px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Külföldi Adószám',
      objectKey: 'thirdStateTaxId',
      colKey: 'thirdStateTaxId',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '150px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Országkód',
      objectKey: 'countryCode',
      colKey: 'countryCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: false,
      mask: 'SS',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Irsz.',
      objectKey: 'postalCode',
      colKey: 'postalCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '80px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Város',
      objectKey: 'city',
      colKey: 'city',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'További címadat',
      objectKey: 'additionalAddressDetail',
      colKey: 'additionalAddressDetail',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Magánszemély?',
      objectKey: 'privatePerson',
      colKey: 'privatePerson',
      defaultValue: '',
      type: 'bool',
      fInputType: 'bool',
      fRequired: false,
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'comment',
      colKey: 'comment',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '25%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  idParam?: number;
  public override getInputParams(override?: Constants.Dct): GetCustomersParamListModel {
    const params = {
      PageNumber: 1 + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? '',
      OrderBy: "customerName",
      ID: this.idParam
    }
    if (override && override["PageNumber"] !== undefined) {
      params.PageNumber = override["PageNumber"] + ''
    }
    this.idParam = undefined
    return params
  }

  countryCodes: CountryCode[] = [];

  private unitPriceTypes: UnitPriceType[] = []

  private paymentMethods: PaymentMethod[] = []

  get maxLimit(): number | undefined {
    return FormHelper.GetNumber(this.dbDataTableForm, 'maxLimit')
  }

  paymentDateValidation(control: AbstractControl): any {
    const value = HelperFunctions.ToInt(control.value)

    return value < 0 ? { min:  { value: value } } : null
  }

  validateWarningLimit(control: AbstractControl): any {
    const warningLimit = HelperFunctions.ToInt(control.value)

    if (warningLimit === 0 && this.maxLimit === 0) {
      return null
    }

    if (warningLimit < 0) {
      return { min: { value: control.value } }
    }

    if (this.maxLimit === undefined || this.maxLimit === 0) {
      return null
    }

    const wrong = warningLimit > this.maxLimit
    return wrong ? { max: { value: control.value } } : null
  }

  validateMinLimitIfMaxIsEdited(control: AbstractControl): any {
    if (this.maxLimit === null || this.maxLimit === undefined) {
      return
    }

    const minControl = this.dbDataTableForm.controls['warningLimit']
    if (!minControl) {
      return
    }

    let error: any = this.maxLimit < 0
      ? { min: { value: control.value } }
      : null

    minControl.setErrors(error)

    const min = HelperFunctions.ToInt(minControl.value)
    if (min <= 0) {
      return
    }

    error = min > this.maxLimit
      ? { max: { value: min } }
      : null
    minControl.setErrors(error)
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private readonly dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Customer>>,
    private readonly customerService: CustomerService,
    private readonly cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private readonly bbxToastrService: BbxToastrService,
    private readonly simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private readonly sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private readonly invoiceService: InvoiceService,
    private readonly keyboardHelperService: KeyboardHelperService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.SetAllColumns();
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'customer-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: Customer): string | number | undefined {
    return data.customerName
  }

  SetAllColumns(): string[] {
    if (this.bbxSidebarService.sideBarOpened) {
      this.AllColumns.next(this.allColumnsWithOpenedSideBar);
      return this.allColumnsWithOpenedSideBar;
    } else {
      this.AllColumns.next(this.allColumns);
      return this.allColumns;
    }
  }

  private ConvertCombosForGet(data: Customer): Customer {
    if (data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode =
        this.countryCodes.find((x) => x.value == data.countryCode)?.text ?? '';
    }

    data.unitPriceType = this.unitPriceTypes.find(x => x.text === data.unitPriceTypeX)?.text ?? 'Listaár'

    data.defPaymentMethod = this.paymentMethods.find(x => x.text === data.defPaymentMethodX)?.text ?? 'Kp'

    return data;
  }

  private CustomerToCreateRequest(customer: Customer): CreateCustomerRequest {
    let country = this.countryCodes.find(x => x.text === customer.countryCode);
    if (country) {
      customer.countryCode = country.value;
    }

    if (customer.customerBankAccountNumber) {
      customer.customerBankAccountNumber = customer.customerBankAccountNumber.replace(/\s/g, '');
    }

    const unitPriceType = this.unitPriceTypes.find(x => x.text === customer.unitPriceType)?.value ?? UnitPriceTypes.List

    const defPaymentMethod = this.paymentMethods.find(x => x.text === customer.defPaymentMethod)?.value ?? 'CASH'

    const res = {
      additionalAddressDetail: customer.additionalAddressDetail,
      city: customer.city,
      comment: customer.comment,
      countryCode: customer.countryCode,
      customerBankAccountNumber: customer.customerBankAccountNumber,
      customerName: customer.customerName,
      isOwnData: customer.isOwnData,
      postalCode: customer.postalCode,
      privatePerson: customer.privatePerson,
      thirdStateTaxId: customer.thirdStateTaxId,
      taxpayerNumber: customer.taxpayerNumber,
      unitPriceType: unitPriceType,
      maxLimit: HelperFunctions.ToOptionalInt(customer.maxLimit),
      warningLimit: HelperFunctions.ToOptionalInt(customer.warningLimit),
      paymentDays: Number(customer.paymentDays),
      defPaymentMethod: defPaymentMethod,
      latestDiscountPercent: HelperFunctions.ToOptionalInt(customer.latestDiscountPercent),
      email: customer.email,
      isFA: customer.isFA
    } as CreateCustomerRequest;
    return res;
  }

  private CustomerToUpdateRequest(customer: Customer): UpdateCustomerRequest {
    if (customer.customerBankAccountNumber) {
      customer.customerBankAccountNumber = customer.customerBankAccountNumber.replace(/\s/g, '');
    }

    let country = this.countryCodes.find(x => x.text === customer.countryCode);
    if (country) {
      customer.countryCode = country.value;
    }

    customer.unitPriceType = this.unitPriceTypes.find(x => x.text === customer.unitPriceType)?.value ?? UnitPriceTypes.List

    customer.defPaymentMethod = this.paymentMethods.find(x => x.text === customer.defPaymentMethod)?.value ?? 'CASH'

    customer.maxLimit = HelperFunctions.ToOptionalInt(customer.maxLimit)
    customer.warningLimit = HelperFunctions.ToOptionalInt(customer.warningLimit)

    customer.paymentDays = Number(customer.paymentDays)
    customer.latestDiscountPercent = HelperFunctions.ToOptionalInt(customer.latestDiscountPercent)

    return customer;
  }

  override ProcessActionNew(data?: IUpdateRequest<Customer>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO

      const createRequest = this.CustomerToCreateRequest(data.data);

      this.sts.pushProcessStatus(
        Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
      );
      this.customerService.Create(createRequest).subscribe({
        next: async (d) => {
          if (d.succeeded && !!d.data) {
            this.idParam = d.data.id;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            await this.RefreshAsync(this.getInputParams());
            this.dbDataTable.SelectRowById(d.data.id);
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
          } else {
            this.simpleToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR_5_SEC
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()
          }
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        }
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<Customer>): void {
    console.log(
      'ActionPut: ',
      data?.data,
      JSON.stringify(data?.data),
      typeof data?.data.id
    );
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO

      const updateRequest = this.CustomerToUpdateRequest(data.data);

      console.log(data.data.id);
      this.sts.pushProcessStatus(
        Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]
      );
      this.customerService.Update(updateRequest).subscribe({
        next: async (d) => {
          if (d.succeeded && !!d.data) {
            this.idParam = d.data.id;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            await this.RefreshAsync(this.getInputParams());
            this.dbDataTable.SelectRowById(d.data.id);
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
          } else {
            this.simpleToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR_5_SEC
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.dbDataTable.SetFormReadonly(false)
            this.kbS.ClickCurrentElement()
          }
        },
        error: (err) => {
          this.HandleError(err);
          this.dbDataTable.SetFormReadonly(false)
        },
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<Customer>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(
        Constants.DeleteStatuses[Constants.DeletePhases.DELETING]
      );
      this.customerService
        .Delete({
          id: id,
        } as DeleteCustomerRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.bbxToastrService.showSuccess(Constants.MSG_DELETE_SUCCESFUL, true);

              this.HandleGridSelectionAfterDelete(di);
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            } else {
              this.bbxToastrService.showError(d.errors!.join('\n'), true);

              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => {
            this.HandleError(err);
          },
        });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      customerName: new FormControl(undefined, [Validators.required]),
      customerBankAccountNumber: new FormControl(undefined, []),
      taxpayerNumber: new FormControl(undefined, []),
      thirdStateTaxId: new FormControl(undefined, []),
      countryCode: new FormControl('Magyarország', [Validators.required]),
      postalCode: new FormControl(undefined, []),
      city: new FormControl(undefined, [Validators.required]),
      additionalAddressDetail: new FormControl(undefined, [
        Validators.required,
      ]),
      unitPriceType: new FormControl('', [Validators.required]),
      privatePerson: new FormControl(false, []),
      comment: new FormControl(undefined, []),
      isFA: new FormControl(false, []),
      email: new FormControl(undefined, []),
      warningLimit: new FormControl(undefined, [
        this.validateWarningLimit.bind(this),
      ]),
      maxLimit: new FormControl(undefined, [
        this.validateMinLimitIfMaxIsEdited.bind(this)
      ]),
      paymentDays: new FormControl(8, [
        this.paymentDateValidation.bind(this)
      ]),
      defPaymentMethod: new FormControl('', [Validators.required]),
      latestDiscountPercent: new FormControl(undefined, [])
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Customer',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      () => {
        return BlankCustomer();
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams({ 'PageNumber': newPageNumber }));
      },
    });

    this.bbxSidebarService.collapse();

    this.RefreshAll(this.getInputParams());

    this.bbxSidebarService.expandEvent.subscribe({
      next: () => {
        let tmp = this.SetAllColumns();
      }
    });
    this.bbxSidebarService.collapseEvent.subscribe({
      next: () => {
        this.SetAllColumns()
      }
    });
  }

  private async RefreshAll(params?: GetCustomersParamListModel): Promise<void> {
    try {
      this.isLoading = true

      const countryCodesRequest = this.customerService.GetAllCountryCodesAsync()
      const unitPriceTypesRequest = this.customerService.getUnitPriceTypes()
      const paymentMethodsRequest = this.invoiceService.getPaymentMethodsAsync()

      this.countryCodes = await countryCodesRequest
      this.unitPriceTypes = await unitPriceTypesRequest
      this.paymentMethods = await paymentMethodsRequest

      this.Refresh(params)
    } catch (error) {
      this.cs.HandleError(error)
    } finally {
      this.isLoading = false
    }
  }

  override Refresh(params?: GetCustomersParamListModel): void {
    if (!!this.Subscription_Refresh && !this.Subscription_Refresh.closed) {
      this.Subscription_Refresh.unsubscribe();
    }

    this.loggerService.info('Refreshing');

    this.isLoading = true;
    this.Subscription_Refresh = this.customerService.GetAll(params).subscribe({
      next: this.getCustomersCallback.bind(this),
      error: (err) => {
        this.HandleError(err);
        this.isLoading = false
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  async RefreshAsync(params?: GetCustomersParamListModel): Promise<void> {
    this.loggerService.info('Refreshing');
    this.isLoading = true;
    await lastValueFrom(this.customerService.GetAll(params))
      .then(this.getCustomersCallback.bind(this))
      .catch(err => {
        this.HandleError(err);
        this.isLoading = false
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private getCustomersCallback(d: GetCustomersResponse): void {
    if (!d.succeeded || !d.data) {
      this.bbxToastrService.showError(d.errors!.join('\n'), true);
      return
    }

    this.dbData = d.data.map((x) => {
      return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
    });
    this.dbDataDataSrc.setData(this.dbData);
    this.dbDataTable.SetPaginatorData(d);
    this.RefreshTable();
  }

  public ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }

  public ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.SetTableAndFormCommandListFromManager();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }

  public ngOnDestroy(): void {
    this.loggerService.info('Detach');
    this.kbS.Detach();
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event'])
  public onKeyDown2(event: KeyboardEvent) {
    if (this.keyboardHelperService.IsKeyboardBlocked) {
      HelperFunctions.StopEvent(event)
      return;
    }
    switch (event.key) {
      case KeyBindings.F11: {
        HelperFunctions.StopEvent(event)
        break
      }
      case this.KeySetting[Actions.Lock].KeyCode: {
        HelperFunctions.StopEvent(event)
        break;
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        HelperFunctions.StopEvent(event)

        this.loggerService.info(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        this.loggerService.info(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Create].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        this.loggerService.info(`${this.KeySetting[Actions.Create].KeyLabel} Pressed: ${this.KeySetting[Actions.Create].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        this.loggerService.info(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.kbS.ElementIdSelected.value === this.searchInputId) {
          break
        }

        if (this.isDialogOpened) {
          return
        }

        this.loggerService.info(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        HelperFunctions.StopEvent(event)

        this.loggerService.info(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Reset].KeyCode: {
        HelperFunctions.StopEvent(event)

        if (this.isDialogOpened) {
          break
        }

        this.loggerService.info(`${this.KeySetting[Actions.Reset].KeyLabel} Pressed: ${this.KeySetting[Actions.Reset].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event)
        break
      }
      default: { }
    }
  }
}
