import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { PieController } from 'chart.js';
import { CountryCode } from '../models/CountryCode';
import { BehaviorSubject, lastValueFrom, ReplaySubject } from 'rxjs';
import { Actions } from 'src/assets/util/KeyBindings';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';

@Component({
  selector: 'app-customer-manager',
  templateUrl: './customer-manager.component.html',
  styleUrls: ['./customer-manager.component.scss'],
})
export class CustomerManagerComponent
  extends BaseManagerComponent<Customer>
  implements OnInit
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
    'isOwnData',
  ];
  allColumnsWithOpenedSideBar = [
    'id',
    'customerName',
    'taxpayerNumber',
    'thirdStateTaxId',
    'isOwnData',
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
    {
      label: 'Saját',
      objectKey: 'isOwnData',
      colKey: 'isOwnData',
      defaultValue: '',
      type: 'bool',
      fInputType: 'bool',
      mask: '',
      colWidth: '70px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
  ];

  idParam?: number;
  override get getInputParams(): GetCustomersParamListModel {
    const params = {
      PageNumber: this.dbDataTable.currentPage + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? '',
      OrderBy: "customerName",
      ID: this.idParam
    };
    this.idParam = undefined;
    return params;
  }

  // CountryCode
  countryCodes: CountryCode[] = [];

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<
      TreeGridNode<Customer>
    >,
    private seInv: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.SetAllColumns();
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'customer-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
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

    return data;
  }

  private CustomerToCreateRequest(p: Customer): CreateCustomerRequest {
    let country = this.countryCodes.find(x => x.text === p.countryCode);
    if (country) {
      p.countryCode = country.value;
    }

    if (p.customerBankAccountNumber) {
      p.customerBankAccountNumber = p.customerBankAccountNumber.replace(/\s/g, '');
    }

    const res = {
      additionalAddressDetail: p.additionalAddressDetail,
      city: p.city,
      comment: p.comment,
      countryCode: p.countryCode,
      customerBankAccountNumber: p.customerBankAccountNumber,
      customerName: p.customerName,
      isOwnData: p.isOwnData,
      postalCode: p.postalCode,
      privatePerson: p.privatePerson,
      thirdStateTaxId: p.thirdStateTaxId,
      taxpayerNumber: p.taxpayerNumber
    } as CreateCustomerRequest;
    return res;
  }

  private CustomerToUpdateRequest(p: Customer): UpdateCustomerRequest {
    if (p.customerBankAccountNumber) {
      p.customerBankAccountNumber = p.customerBankAccountNumber.replace(/\s/g, '');
    }

    let country = this.countryCodes.find(x => x.text === p.countryCode);
    if (country) {
      p.countryCode = country.value;
    }
    return p;
  }

  override ProcessActionNew(data?: IUpdateRequest<Customer>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      data.data.id = parseInt(data.data.id + ''); // TODO

      const createRequest = this.CustomerToCreateRequest(data.data);

      this.sts.pushProcessStatus(
        Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]
      );
      this.seInv.Create(createRequest).subscribe({
        next: async (d) => {
          if (d.succeeded && !!d.data) {
            this.idParam = d.data.id;
            await this.RefreshAsync(this.getInputParams);
            this.dbDataTable.SelectRowById(d.data.id);
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => {
          this.cs.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        },
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
      this.seInv.Update(updateRequest).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = { data: d.data } as TreeGridNode<Customer>;
            const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
            this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable(newRow.data.id);
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            this.dbDataTable.flatDesignForm.SetFormStateToDefault();
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          } else {
            this.bbxToastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
          }
        },
        error: (err) => {
          this.cs.HandleError(err);
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
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
      this.seInv
        .Delete({
          id: id,
        } as DeleteCustomerRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.simpleToastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.HandleGridSelectionAfterDelete(di);
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            } else {
              this.bbxToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => {
            this.cs.HandleError(err);
            this.isLoading = false;
            this.sts.pushProcessStatus(Constants.BlankProcessStatus);
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
      countryCode: new FormControl('HU', []),
      postalCode: new FormControl(undefined, []),
      city: new FormControl(undefined, [Validators.required]),
      additionalAddressDetail: new FormControl(undefined, [
        Validators.required,
      ]),
      privatePerson: new FormControl(false, []),
      comment: new FormControl(undefined, []),
      isOwnData: new FormControl(false, []),
      email: new FormControl(undefined, []),
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
        this.Refresh(this.getInputParams);
      },
    });

    this.bbxSidebarService.collapse();

    this.RefreshAll(this.getInputParams);

    this.bbxSidebarService.expandEvent.subscribe({
      next: () => {
        let tmp = this.SetAllColumns();
      }
    });
    this.bbxSidebarService.collapseEvent.subscribe({
      next: () => {
        this.kbS.SelectElementByCoordinate(0, this.kbS.p.y);
        let tmp = this.SetAllColumns();
      }
    });
  }

  private RefreshAll(params?: GetCustomersParamListModel): void {
    // CountryCodes
    this.seInv.GetAllCountryCodes().subscribe({
      next: (data) => {
        if (!!data) this.countryCodes = data;
      },
      error: (err) => {
        {
          this.cs.HandleError(err);
          this.isLoading = false;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.Refresh(params);
      },
    });
  }

  override Refresh(params?: GetCustomersParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetCustomers response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => {
        this.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  async RefreshAsync(params?: GetCustomersParamListModel): Promise<void> {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    await lastValueFrom(this.seInv.GetAll(params))
      .then(d => {
        if (d.succeeded && !!d.data) {
          console.log('GetCustomers response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      })
      .catch(err => {
        this.HandleError(err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.SetTableAndFormCommandListFromManager();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Create].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Create].KeyLabel} Pressed: ${this.KeySetting[Actions.Create].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }
}
