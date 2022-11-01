import { Component, HostListener, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDialogService, NbTreeGridDataSource } from '@nebular/theme';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IEditable } from 'src/assets/model/IEditable';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { Actions, OfferNavKeySettings, KeyBindings, IsKeyFunctionKey } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustomerDialogTableSettings } from 'src/assets/model/TableSettings';
import { Customer } from '../../customer/models/Customer';
import { CustomerSelectTableDialogComponent } from '../../invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { TableKeyDownEvent } from '../inline-editable-table/inline-editable-table.component';
import { CreateNewProductDialogComponent } from '../create-new-product-dialog/create-new-product-dialog.component';
import { Product } from '../../product/models/Product';

@Component({
  selector: 'app-base-inline-manager',
  templateUrl: './base-inline-manager.component.html',
  styleUrls: ['./base-inline-manager.component.scss'],
})
export class BaseInlineManagerComponent<T extends IEditable> {
  searchInputId?: string;
  searchString: string = '';

  get selectedSearchFieldType(): Constants.SearchFieldTypes {
    if (this.customerSearchFocused) {
      return Constants.SearchFieldTypes.Form;
    }
    else if (this.productSearchFocused) {
      return Constants.SearchFieldTypes.Product;
    }
    return Constants.SearchFieldTypes.Other;
  }
  customerSearchFocused: boolean = false;
  productSearchFocused: boolean = false;

  dbDataTableId: string = '';
  dbDataTableEditId: string = '';

  colsToIgnore: string[] = [];
  allColumns: string[] = [];
  colDefs: ModelFieldDescriptor[] = [];

  cellClass: string = '';

  dbDataTableForm!: FormGroup;
  dbData!: TreeGridNode<T>[];
  dbDataDataSrc!: NbTreeGridDataSource<TreeGridNode<T>>;
  dbDataTable!: InlineEditableNavigatableTable<T>;

  tableIsFocused: boolean = false;
  get IsTableFocused(): boolean {
    return this.tableIsFocused;
  }

  isLoading: boolean = true;
  isSaveInProgress: boolean = false;

  get showSpinnerOnTable(): boolean {
    return this.isLoading && !this.sts.InProgress;
  }

  protected uid = 0;
  protected nextUid() {
    ++this.uid;
    return this.uid;
  }

  get getInputParams(): any {
    return {};
  }

  commands: FooterCommandInfo[] = [
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

  numberInputMask = NgNeatInputMasks.numberInputMask;
  offerDiscountInputMask = NgNeatInputMasks.offerDiscountInputMask;
  numberInputMaskInteger = NgNeatInputMasks.numberInputMaskInteger;
  
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  };

  constructor(
    @Optional() protected dialogService: NbDialogService,
    protected kbS: KeyboardNavigationService,
    protected fS: FooterService,
    protected cs: CommonService,
    protected sts: StatusService,
    protected sideBarService: BbxSidebarService,
    protected khs: KeyboardHelperService
  ) {
    this.sideBarService.collapse();
  }

  HandleError(err: any): void {
    this.cs.HandleError(err);
    this.isLoading = false;
    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
  }

  HandleGridSelectionAfterDelete(indexOfDeleteItem: number): void {
    if (this.dbData.length > indexOfDeleteItem) {
      this.RefreshTable((this.dbData[indexOfDeleteItem].data as any).id);
    } else if (this.dbData.length > 0) {
      this.RefreshTable((this.dbData[this.dbData.length - 1].data as any).id);
    } else {
      this.RefreshTable();
    }
  }

  ActionNew(data?: IUpdateRequest<T>): void {
    console.log('ActionNew: ', data);

    if (data?.needConfirmation) {
      const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
        context: { msg: Constants.MSG_CONFIRMATION_SAVE },
      });
      dialogRef.onClose.subscribe((res) => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(
              ConfirmationDialogComponent,
              { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } }
            );
            dialogRef.onClose.subscribe((res) => {
              if (res) {
                this.clearSearch();
                this.ProcessActionNew(data);
              }
            });
          } else {
            this.ProcessActionNew(data);
          }
        }
      });
    } else {
      this.ProcessActionNew(data);
    }
  }
  ProcessActionNew(data?: IUpdateRequest<T>): void {}

  ActionReset(data?: IUpdateRequest<T>): void {
    this.ProcessActionReset(data);
  }
  ProcessActionReset(data?: IUpdateRequest<T>): void {
    // this.dbDataTable.ResetForm();
  }

  ActionPut(data?: IUpdateRequest<T>): void {
    console.log('ActionPut: ', data);
    if (data?.needConfirmation) {
      const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
        context: { msg: Constants.MSG_CONFIRMATION_SAVE },
      });
      dialogRef.onClose.subscribe((res) => {
        if (res) {
          if (this.searchString !== undefined && this.searchString.length > 0) {
            const dialogRef = this.dialogService.open(
              ConfirmationDialogComponent,
              { context: { msg: Constants.MSG_CONFIRMATION_FILTER_DELETE } }
            );
            dialogRef.onClose.subscribe((res) => {
              if (res) {
                this.clearSearch();
                this.ProcessActionPut(data);
              }
            });
          } else {
            this.ProcessActionPut(data);
          }
        }
      });
    } else {
      this.ProcessActionPut(data);
    }
  }
  ProcessActionPut(data?: IUpdateRequest<T>): void {}

  ActionDelete(data?: IUpdateRequest<T>): void {
    console.log('ActionDelete: ', data);
    if (data?.needConfirmation) {
      const dialogRef = this.dialogService.open(ConfirmationDialogComponent, {
        context: { msg: Constants.MSG_CONFIRMATION_DELETE },
      });
      dialogRef.onClose.subscribe((res) => {
        if (res) {
          this.ProcessActionDelete(data);
        }
      });
    } else {
      this.ProcessActionDelete(data);
    }
  }
  ProcessActionDelete(data?: IUpdateRequest<T>): void {}

  ActionRefresh(data?: IUpdateRequest<T>): void {
    this.Refresh(this.getInputParams);
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if ((this.khs.IsDialogOpened && IsKeyFunctionKey(event.key)) || this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    if (event.key === KeyBindings.Tab) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();

      // var press = jQuery.Event("keydown");
      // press.ctrlKey = false;
      // press.key = KeyBindings.Enter;
      // $(window).trigger(press);
    }
    switch (event.key) {
      case OfferNavKeySettings[Actions.Search].KeyCode: {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        if (this.searchInputId !== undefined) {
          console.log('F2 pressed, focusing search input');
          $(`#${this.searchInputId}`).trigger('focus');
        }
        break;
      }
      default: {
      }
    }
  }

  refreshFilter(event: any): void {
    if (this.searchString === event.target.value) {
      return;
    }
    this.searchString = event.target.value;
    console.log('Search: ', this.searchString);
    this.search();
  }

  clearSearch(input?: any): void {
    if (input !== undefined) {
      input.value = '';
    } else {
      $('#' + this.searchInputId!).val('');
    }
    this.searchString = '';

    this.search();
  }

  search(): void {
    this.Refresh(this.getInputParams);
  }

  Refresh(params?: any): void {}

  RefreshTable(selectAfterRefresh?: any): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      this.cellClass
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false);
    }, 200);
  }

  trackRows(index: number, row: any) {
    return row.uid;
  }

  focusOnTable(focusIn: boolean): void {
    this.tableIsFocused = focusIn;
    if (focusIn) {
      this.dbDataTable.PushFooterCommandList();
    } else {
      this.fS.pushCommands(this.commands);
    }
  }

  SetDataForForm(data: any): void {}

  CreateCustomer(event: any): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(TaxNumberSearchCustomerEditDialogComponent, {
      context: {
        createCustomer: true
      },
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: (res: Customer) => {
        console.log("Selected item: ", res);
        if (!!res) {
          this.SetDataForForm(res);
        }
      },
      error: err => {
        this.cs.HandleError(err);
      }
    });
  }

  CreateProduct(event: any, handler: (p: Product) => Promise<void>): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(CreateNewProductDialogComponent, {
      context: {},
      closeOnEsc: false
    });
    dialogRef.onClose.subscribe({
      next: async (res: Product) => {
        console.log("Created product: ", res);
        if (!!res) {
          await handler(res);
        }
      },
      error: err => {
        this.cs.HandleError(err);
      }
    });
  }

  public onTableFunctionKeyDown(event: TableKeyDownEvent): void {
    this.HandleKeyDown(event);
  }

  public HandleKeyDown(event: Event | TableKeyDownEvent): void {}

  public onFormSearchFocused(): void { this.customerSearchFocused = true; }
  public onFormSearchBlurred(): void { this.customerSearchFocused = false; }
}
