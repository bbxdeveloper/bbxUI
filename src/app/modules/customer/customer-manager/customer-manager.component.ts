import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ColDef';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Nav } from 'src/assets/model/Navigatable';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NbSidebarService } from '@nebular/theme';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { Customer } from '../models/Customer';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerRequest } from '../models/CreateCustomerRequest';
import { UpdateCustomerRequest } from '../models/UpdateCustomerRequest';
import { DeleteCustomerRequest } from '../models/DeleteCustomerRequest';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';

@Component({
  selector: 'app-customer-manager',
  templateUrl: './customer-manager.component.html',
  styleUrls: ['./customer-manager.component.scss']
})
export class CustomerManagerComponent implements OnInit, IUpdater<Customer> {
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableForm!: FormGroup;
  dbData!: TreeGridNode<Customer>[];
  dbDataDataSrc!: NbTreeGridDataSource<TreeGridNode<Customer>>;
  dbDataTable!: Nav.FlatDesignNavigatableTable<Customer>;
  dbDataTableId = 'customer-table';
  dbDataTableEditId = "user-cell-edit-input";

  colsToIgnore: string[] = [];
  allColumns = [
    'id', 'customerName', 'taxPayerNumber'
  ];
  colDefs: ModelFieldDescriptor[] = [
    { label: 'ID', objectKey: 'id', colKey: 'id', defaultValue: '', type: 'string', fInputType: 'readonly', mask: "", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Név', objectKey: 'customerName', colKey: 'customerName', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "30%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Számlaszám', objectKey: 'customerBankAccountNumber', colKey: 'customerBankAccountNumber', defaultValue: '', type: 'string', fInputType: 'text', mask: "SS00 0000 0000 0000 0000 0000 0000||SSSSSSSS-SSSSSSSS-SSSSSSSS", colWidth: "15%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Belföldi Adószám', objectKey: 'taxPayerNumber', colKey: 'taxPayerNumber', defaultValue: '', type: 'string', fInputType: 'text', mask: "0000000-0-00", colWidth: "40%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Külföldi Adószám', objectKey: 'thirdStateTaxId', colKey: 'thirdStateTaxId', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Országkód', objectKey: 'countryCode', colKey: 'countryCode', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "SS", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Irsz.', objectKey: 'postalCode', colKey: 'postalCode', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Város', objectKey: 'city', colKey: 'city', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'További címadat', objectKey: 'additionalAddressDetail', colKey: 'additionalAddressDetail', defaultValue: '', type: 'string', fInputType: 'text', fRequired: true, mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Magánszemély?', objectKey: 'privatePerson', colKey: 'privatePerson', defaultValue: '', type: 'bool', fInputType: 'bool', fRequired: true, mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
    { label: 'Megjegyzés', objectKey: 'comment', colKey: 'comment', defaultValue: '', type: 'string', fInputType: 'text', mask: "", colWidth: "25%", textAlign: "center", navMatrixCssClass: Nav.TileCssClass },
  ]

  tableIsFocused: boolean = false;
  private uid = 0;

  readonly commands: FooterCommandInfo[] = [
    { key: 'F1', value: '', disabled: false },
    { key: 'F2', value: '', disabled: false },
    { key: 'F3', value: '', disabled: false },
    { key: 'F4', value: '', disabled: false },
    { key: 'F5', value: '', disabled: false },
    { key: 'F6', value: '', disabled: false },
    { key: 'F7', value: '', disabled: false },
    { key: 'F8', value: '', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
    { key: 'F11', value: '', disabled: false },
    { key: 'F12', value: 'Tétellap', disabled: false },
  ];

  get isSideBarOpened(): boolean { return this.sidebarService.sideBarOpened; };

  searchString: string = '';

  constructor(
    @Optional() private dialogService: NbDialogService,
    private fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Customer>>,
    private seInv: CustomerService,
    private cdref: ChangeDetectorRef,
    private kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    private sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    this.kbS.ResetToRoot();
    this.Setup();
  }

  ActionNew(data?: IUpdateRequest<Customer>): void {
    if (!!data && !!data.data) {
      console.log("ActionNew: ", data.data);
      this.seInv.CreateCustomer(data.data).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData.push({ data: d.data } as TreeGridNode<Customer>);
            this.RefreshTable();
            this.toastrService.show(Constants.MSG_SAVE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          }
        },
        error: err => this.cs.HandleError(err)
      });
    }
  }
  ActionReset(data?: IUpdateRequest<Customer>): void {
    this.dbDataTable.ResetForm();
  }
  ActionPut(data?: IUpdateRequest<Customer>): void {
    if (!!data && !!data.data) {
      console.log("ActionPut: ", data.data);
      this.seInv.UpdateCustomer(data.data as UpdateCustomerRequest).subscribe({
        next: d => {
          if (d.succeeded && !!d.data) {
            this.dbData[data.rowIndex] = { data: d.data } as TreeGridNode<Customer>;
            this.RefreshTable();
            this.toastrService.show(Constants.MSG_SAVE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
          } else {
            this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
          }
        },
        error: err => this.cs.HandleError(err)
      });
    }
  }
  ActionDelete(data?: IUpdateRequest<Customer>): void {
    const dialogRef = this.dialogService.open(
      ConfirmationDialogComponent,
      { context: { msg: Constants.MSG_CONFIRMATION_DELETE } }
    );
    dialogRef.onClose.subscribe(res => {
      if (res) {
        if (!!data && data.data?.id !== undefined) {
          console.log("ActionDelete: ", data.rowIndex);
          this.seInv.DeleteCustomer({
            id: data.data?.id
          } as DeleteCustomerRequest).subscribe({
            next: d => {
              if (d.succeeded && !!d.data) {
                const di = this.dbData.findIndex(x => x.data.id === data.data.id);
                this.dbData.splice(di, 1);
                this.RefreshTable();
                this.toastrService.show(Constants.MSG_DELETE_SUCCESFUL, Constants.TITLE_INFO, Constants.TOASTR_SUCCESS);
              } else {
                this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
              }
            },
            error: err => this.cs.HandleError(err)
          });
        }
      }
    });
  }
  
  refreshFilter(event: any): void {
    this.searchString = event.target.value;
    console.log("Search: ", this.searchString);
    this.search();
  }

  search(): void {
    // console.log("Search: ", this.searchString);
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Refresh(this.searchString);
    }
  }

  private Setup(): void {
    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);
    // TODO: FormGroup generator
    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, [Validators.required]),
      customerName: new FormControl(undefined, [Validators.required]),
      customerBankAccountNumber: new FormControl(undefined, []),
      taxPayerNumber: new FormControl(undefined, []),
      thirdStateTaxId: new FormControl(undefined, []),
      countryCode: new FormControl('HU', [Validators.required]),
      postalCode: new FormControl(undefined, []),
      city: new FormControl(undefined, [Validators.required]),
      additionalAddressDetail: new FormControl(undefined, [Validators.required]),
      privatePerson: new FormControl(false, [Validators.required]),
      comment: new FormControl(undefined, []),
    });
    this.dbDataTable = new Nav.FlatDesignNavigatableTable(
      this.dbDataTableForm, 'Customer', this.dataSourceBuilder, this.kbS, this.fS, this.cdref, this.dbData, this.dbDataTableId, Nav.AttachDirection.DOWN,
      'sideBarForm', Nav.AttachDirection.RIGHT, this.sidebarService, this.sidebarFormService, this
    );
    this.dbDataTable.pushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.sidebarService.collapse();
    this.Refresh();
  }

  private Refresh(searchString?: string): void {
    console.log('Refreshing'); // TODO: only for debug
    this.seInv.GetCustomers(!!searchString ? { 'CustomerName': searchString } : undefined).subscribe({
      next: d => {
        if (d.succeeded && !!d.data) {
          console.log('GetCustomers response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map(x => { return { data: x, uid: this.nextUid() }; });
            this.dbDataDataSrc.setData(this.dbData);
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(d.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
        }
      },
      error: err => this.cs.HandleError(err)
    });
  }

  private RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData, this.dbDataDataSrc,
      this.allColumns, this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false);
      this.kbS.SelectFirstTile();
    }, 200);
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.pushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private nextUid() {
    ++this.uid
    return this.uid;
  }

  trackRows(index: number, row: any) {
    return row.uid;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (focusIn) {
      this.dbDataTable.pushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }
}
