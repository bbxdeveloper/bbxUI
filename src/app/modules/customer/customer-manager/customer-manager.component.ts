import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
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
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Azonosító',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '130px',
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
      colWidth: '170px',
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
      colWidth: '170px',
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

  override get getInputParams(): GetCustomersParamListModel {
    return {
      PageNumber: this.dbDataTable.currentPage + '',
      PageSize: this.dbDataTable.pageSize,
      SearchString: this.searchString ?? '',
    };
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
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'customer-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForGet(data: Customer): Customer {
    if (data.countryCode !== undefined && this.countryCodes.length > 0) {
      data.countryCode =
        this.countryCodes.find((x) => x.value == data.countryCode)?.text ?? '';
    }

    return data;
  }

  private CustomerToCreateRequest(p: Customer): CreateCustomerRequest {
    let countryCode = !!p.countryCode?.includes('-')
      ? p.countryCode.split('-')[0]
      : '';

    const res = {
      additionalAddressDetail: p.additionalAddressDetail,
      city: p.city,
      comment: p.comment,
      countryCode: countryCode,
      customerBankAccountNumber: p.customerBankAccountNumber,
      customerName: p.customerName,
      isOwnData: p.isOwnData,
      postalCode: p.postalCode,
      privatePerson: p.privatePerson,
      thirdStateTaxId: p.thirdStateTaxId,
    } as CreateCustomerRequest;
    return res;
  }

  private CustomerToUpdateRequest(p: Customer): UpdateCustomerRequest {
    let countryCode = !!p.countryCode?.includes('-')
      ? p.countryCode.split('-')[0]
      : '';
    p.countryCode = countryCode;
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
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = { data: d.data } as TreeGridNode<Customer>;
            this.dbData.push(newRow);
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
            this.dbData[data.rowIndex] = newRow;
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable();
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
        Constants.CRUDDeleteStatuses[Constants.CRUDDeletePhases.DELETING]
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
      this.sidebarService,
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

    this.sidebarService.collapse();

    this.RefreshAll(this.getInputParams);
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
            this.dbDataTable.currentPage = d.pageNumber;
            this.dbDataTable.allPages = this.GetPageCount(
              d.recordsFiltered,
              d.pageSize
            );
            this.dbDataTable.totalItems = d.recordsFiltered;
            this.dbDataTable.itemsOnCurrentPage = this.dbData.length;
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

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }
}
