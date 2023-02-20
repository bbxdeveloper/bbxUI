import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbTable, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortDirection } from '@nebular/theme';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, GetFooterCommandListFromKeySettings, KeyBindings, CustDiscountKeySettings } from 'src/assets/util/KeyBindings';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CustomerDialogTableSettings, ProductGroupDialogTableSettings } from 'src/assets/model/TableSettings';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { lastValueFrom, Subscription } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { CustDiscount, CustDiscountFromCustDiscountForGet } from '../models/CustDiscount';
import { CreateCustDiscountRequest } from '../models/CreateCustDiscountRequest';
import { ProductGroupService } from '../../product-group/services/product-group.service';
import { CustomerDiscountService } from '../services/customer-discount.service';
import { ProductGroup } from '../../product-group/models/ProductGroup';
import { CountryCode } from '../../customer/models/CountryCode';
import { GetCustomerByTaxNumberParams } from '../../customer/models/GetCustomerByTaxNumberParams';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { TaxNumberSearchCustomerEditDialogComponent } from '../../invoice/tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { OneNumberInputDialogComponent } from '../../shared/one-number-input-dialog/one-number-input-dialog.component';
import { CustomerSelectTableDialogComponent } from '../../invoice/customer-select-table-dialog/customer-select-table-dialog.component';
import { ProductGroupSelectTableDialogComponent } from '../product-group-select-table-dialog/product-group-select-table-dialog.component';
import { GetProductGroupsParamListModel } from '../../product-group/models/GetProductGroupsParamListModel';
import { TableKeyDownEvent, isTableKeyDownEvent, EditedCellId, SelectFirstCharClass } from '../../shared/inline-editable-table/inline-editable-table.component';
import { GetCustDiscountByCustomerParamsModel } from '../models/GetCustDiscountByCustomerParamsModel';

@Component({
  selector: 'app-customer-discount-manager',
  templateUrl: './customer-discount-manager.component.html',
  styleUrls: ['./customer-discount-manager.component.scss']
})
export class CustomerDiscountManagerComponent extends BaseInlineManagerComponent<CustDiscount> implements OnInit, AfterViewInit, OnDestroy, IInlineManager {
  @ViewChild('table') table?: NbTable<any>;

  public KeySetting: Constants.KeySettingsDct = CustDiscountKeySettings;
  override readonly commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  custDiscountData!: CreateCustDiscountRequest;

  readonly SearchButtonId: string = 'offers-button-search';

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  countryCodes: CountryCode[] = [];
  productGroups: ProductGroup[] = [];

  get ProductGroupGetAllParams(): GetProductGroupsParamListModel {
    return {
      PageSize: '1000'
    };
  }

  override colsToIgnore: string[] = ['ProductGroup'];
  override allColumns = [
    'ProductGroupCode',
    'ProductGroup',
    'Discount',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Tcs.kód', objectKey: 'ProductGroupCode', colKey: 'ProductGroupCode',
      defaultValue: '', type: 'text', mask: Constants.CustDiscountCodeMask, fReadonly: false,
      colWidth: "200px", textAlign: "left", fInputType: "code-field", cursorAfterLastChar: true
    },
    {
      label: 'Megnevezés', objectKey: 'ProductGroup', colKey: 'ProductGroup',
      defaultValue: '', type: 'text', mask: "", fReadonly: true,
      colWidth: "80%", textAlign: "left"
    },
    {
      label: 'Eng%', objectKey: 'Discount', colKey: 'Discount',
      defaultValue: '', type: 'number', mask: "",
      colWidth: "20%", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    }
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  Subscription_FillFormWithFirstAvailableCustomer?: Subscription;
  buyerForm!: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav!: InlineTableNavigatableForm;
  customerInputFilterString: string = '';
  _searchByTaxtNumber: boolean = false;
  get searchByTaxtNumber(): boolean { return this._searchByTaxtNumber; }
  set searchByTaxtNumber(value: boolean) {
    this._searchByTaxtNumber = value;
    this.cdref.detectChanges();
    this.buyerFormNav.GenerateAndSetNavMatrices(false, true);
    this.AddSearchButtonToFormMatrix();
  }

  cachedCustomerName?: string;
  buyerData!: Customer;
  buyersData: Customer[] = [];

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  get invCtrlDate(): Date | undefined {
    if (!!!this.buyerForm) {
      return undefined;
    }
    const tmp = this.buyerForm.controls['invCtrlDate'].value;

    return !HelperFunctions.IsDateStringValid(tmp) ? undefined : new Date(tmp);
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<CustDiscount>>,
    private seC: CustomerService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService,
    sideBarService: BbxSidebarService,
    khs: KeyboardHelperService,
    private productGroupService: ProductGroupService,
    private custDiscountService: CustomerDiscountService,
  ) {
    super(dialogService, kbS, fS, cs, sts, sideBarService, khs);
    this.InitialSetup();
  }

  private AddSearchButtonToFormMatrix(): void {
    this.buyerFormNav.Matrix[this.buyerFormNav.Matrix.length - 1].push(this.SearchButtonId);
  }

  InitialSetup(): void {
    this.dbDataTableId = "offers-inline-table-invoice-line";
    this.cellClass = "PRODUCT";

    this.custDiscountData = {
      customerID: -1,
      items: []
    } as CreateCustDiscountRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    if (this.buyerForm === undefined) {
      this.buyerForm = new FormGroup({
        customerSearch: new FormControl('', []),
        customerName: new FormControl('', [Validators.required]),
        customerAddress: new FormControl('', [Validators.required]),
        customerTaxNumber: new FormControl('', [Validators.required]),
      });
    } else {
      this.buyerForm.reset(undefined);
    }

    this.buyerFormNav = new InlineTableNavigatableForm(
      this.buyerForm,
      this.kbS,
      this.cdref,
      [],
      this.buyerFormId,
      AttachDirection.DOWN,
      this
    );

    this.buyerFormNav!.OuterJump = true;

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new CustDiscount();
      },
      this
    );

    this.dbDataTable!.OuterJump = true;

    this.isLoading = false;
  }

  public async SearchButtonClicked(): Promise<void> {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    if (this.buyerForm.invalid) {
      this.bbxToastrService.show(
        Constants.MSG_USER_MUST_BE_CHOSEN,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
    } else {
      await this.refresh();
    }
  }

  public SetNavigationMode() {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  async refresh(): Promise<void> {
    await lastValueFrom(this.seC.GetAllCountryCodes())
      .then((data) => {
        if (!!data) this.countryCodes = data;
      })
      .catch((err) => {
        this.cs.HandleError(err);
      });
    await lastValueFrom(this.productGroupService.GetAll(this.ProductGroupGetAllParams))
      .then((data) => {
        if (!!data) this.productGroups = data.data ?? [];
      })
      .catch((err) => {
        this.cs.HandleError(err);
      });

    if (this.buyerData?.id === undefined || this.buyerData?.id < 0) {
      return;
    }

    this.isLoading = true;

    await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: this.buyerData?.id !== undefined ? this.buyerData?.id : -1 }))
    .then(res => {
      // Products
      this.dbData = res.map(item => ({ data: CustDiscountFromCustDiscountForGet(item) } as TreeGridNode<CustDiscount>));

      this.dbData.forEach(x => {
        x.data.Save('productGroupCode');
      });

      this.dbDataDataSrc.setData(this.dbData);

      this.table?.renderRows();
      this.RefreshTable();
    })
    .catch(err => {
      this.cs.HandleError(err);
    })
    .finally(() => {
      this.isLoading = false;
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
        this.kbS.Jump(AttachDirection.DOWN, false);
      }
    });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.AfterViewInitSetup();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  private UpdateOutGoingData() {
    console.log("[UpdateOutGoingData]: ", this.dbData);

    if (this.dbData.length === 1) {
      this.custDiscountData.items = [];
    } else {
      const _dbData = this.dbData.slice(0, this.dbData.length - 1);
      this.custDiscountData.items = _dbData.map(x => x.data.ToCustDiscountForPostItem());
    }

    this.custDiscountData.customerID = this.buyerData.id;

    console.log("[UpdateOutGoingData]: ", this.custDiscountData, this.dbData);
  }

  Save(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    HelperFunctions.confirmAsync(this.dialogService, Constants.MSG_CONFIRMATION_SAVE_DATA, async () => {
      this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

      this.UpdateOutGoingData();

      console.log('Save: ', this.custDiscountData);

      await lastValueFrom(this.custDiscountService.Create(this.custDiscountData))
      .then(d => {
          if (!!d.data) {
            console.log('Save response: ', d);

            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );

            this.dbDataTable.RemoveEditRow();
            this.kbS.SelectFirstTile();

            this.Reset();
          } else {
            this.cs.HandleError(d.errors);
          }
        })
        .catch(err => {
          this.cs.HandleError(err);
        })
        .finally(() => {});

      this.sts.pushProcessStatus(Constants.BlankProcessStatus);
    });
  }

  protected Reset(): void {
    console.log(`Reset.`);
    this.kbS.ResetToRoot();
    this.InitialSetup();
    this.AfterViewInitSetup();
  }

  protected AfterViewInitSetup(): void {
    this.InitFormDefaultValues();

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.buyerFormNav.GenerateAndSetNavMatrices(true);
    this.AddSearchButtonToFormMatrix();

    this.dbDataTable?.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable?.GenerateAndSetNavMatrices(true);
    this.dbDataTable!.commandsOnTable = this.commands;
    this.dbDataTable!.commandsOnTableEditMode = this.commands;
    this.dbDataTable?.PushFooterCommandList();

    setTimeout(() => {
      this.kbS.SetCurrentNavigatable(this.buyerFormNav);
      this.kbS.SelectFirstTile();
      this.kbS.setEditMode(KeyboardModes.EDIT);

      this.cdref.detectChanges();
    }, 500);
  }

  InitFormDefaultValues(): void {}

  HandleProductSelectionFromDialog(res: ProductGroup, rowIndex: number) {
    if (res.id === undefined || res.id === -1) {
      return;
    }

    if ((this.dbDataTable.data[rowIndex].data.productGroupID === -1 && this.dbDataTable.data[rowIndex].data.productGroupCode === res.productGroupCode) ||
      (this.dbDataTable.data[rowIndex].data.productGroupCode !== res.productGroupCode &&
       this.dbDataTable.data.findIndex(x => x.data?.productGroupID === res.id) > -1)) {
      this.bbxToastrService.show(
        Constants.MSG_PRODUCT_ALREADY_THERE,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      this.isLoading = false;
      return;
    }

    let changedData = this.dbData[rowIndex].data;
    changedData.productGroupCode = res.productGroupCode;
    changedData.productGroup = res.productGroupDescription;
    changedData.productGroupID = res.id;

    let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: changedData });
    currentRow?.data.Save('productGroupCode');

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    this.dbDataTable.MoveNextInTable();
    setTimeout(() => {
      this.kbS.setEditMode(KeyboardModes.EDIT);
      this.kbS.ClickCurrentElement();
    }, 500);

    return;
  }

  MoveToSearchButton(event: any): void {
    if (this.isEditModeOff) {
      this.buyerFormNav!.HandleFormEnter(event, true, true, true);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.MoveDown();
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  ChooseDataForTableRow(rowIndex: number, wasInNavigationMode: boolean): void {
    console.log("Selecting ProductGroup from avaiable data.");

    console.log("[TableCodeFieldChanged] at rowIndex: ", this.dbDataTable.data[rowIndex])

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(ProductGroupSelectTableDialogComponent, {
      context: {
        searchString: this.dbDataTable.editedRow?.data.productGroupCode ?? '',
        allColumns: ProductGroupDialogTableSettings.ProductGroupSelectorDialogAllColumns,
        colDefs: ProductGroupDialogTableSettings.ProductGroupSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe((res: ProductGroup) => {
      console.log("Selected item: ", res);
      if (!!res) {
        if (!wasInNavigationMode) {
          this.HandleProductSelectionFromDialog(res, rowIndex);
        } else {
          const index = this.dbDataTable.data.findIndex(x => x.data.productGroupCode === res.productGroupCode);
          if (index !== -1) {
            this.kbS.SelectElementByCoordinate(0, index);
          }
        }
      }
    });
  }

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

        this.kbS.SetCurrentNavigatable(this.buyerFormNav);
        this.kbS.SelectFirstTile();
        this.kbS.setEditMode(KeyboardModes.EDIT);
      }
    });
  }

  CopyDiscounts(): void {
    console.log("Selecting Customer from avaiable data.");

    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    const dialogRef = this.dialogService.open(CustomerSelectTableDialogComponent, {
      context: {
        allColumns: CustomerDialogTableSettings.CustomerSelectorDialogAllColumns,
        colDefs: CustomerDialogTableSettings.CustomerSelectorDialogColDefs
      }
    });
    dialogRef.onClose.subscribe(async (res: Customer) => {
      console.log("Selected item: ", res);
      if (!!res) {
        HelperFunctions.confirmAsync(this.dialogService, Constants.MSG_CONFIRMATION_COPY_CUST_DISCOUNTS, async () => {
          await lastValueFrom(this.custDiscountService.GetByCustomer({ CustomerID: res.id !== undefined ? res.id : -1 }))
            .then(res => {
              // Products
              this.dbData = res.filter(x => !!x.productGroupCode.trim()).map(item => ({ data: CustDiscountFromCustDiscountForGet(item) } as TreeGridNode<CustDiscount>));

              this.dbData.sort((a, b) => {
                var n1 = a.data.ProductGroupCode;
                var n2 = b.data.ProductGroupCode;
                if (n1 > n2) {
                  return 1;
                }
                if (n1 < n2) {
                  return -1;
                }
                return 0;
              });

              this.dbData.forEach(x => {
                x.data.Save('productGroupCode');
              });

              this.dbDataDataSrc.setData(this.dbData);

              this.table?.renderRows();
              this.RefreshTable();
            })
            .catch(err => {
              this.cs.HandleError(err);
            })
            .finally(() => {
              this.isLoading = false;
              this.kbS.setEditMode(KeyboardModes.NAVIGATION);
              this.kbS.SetCurrentNavigatable(this.buyerFormNav);
              this.kbS.SelectFirstTile();
              //this.kbS.setEditMode(KeyboardModes.EDIT);
              if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
                this.kbS.Jump(AttachDirection.DOWN, false);
              }
              this.kbS.SelectFirstTile();
            });
        });
      }
    });
  }

  RefreshData(): void { }
  RecalcNetAndVat(): void { }

  HandleGridCodeFieldEnter(event: any, row: TreeGridNode<CustDiscount>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    if (!!event) {
      this.bbxToastrService.close();
      event.stopPropagation();
    }
    console.log('[HandleGridCodeFieldEnter]: editmode off: ', this.isEditModeOff);
    if (this.isEditModeOff) {
      this.dbDataTable.HandleGridEnter(row, rowPos, objectKey, colPos, inputId, fInputType);
      setTimeout(() => {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION);
        this.kbS.ClickCurrentElement();
      }, 50);
    } else {
      this.TableCodeFieldChanged(row.data, rowPos, row, rowPos, objectKey, colPos, inputId, fInputType);
    }
  }

  protected TableCodeFieldChanged(changedData: any, index: number, row: TreeGridNode<CustDiscount>, rowPos: number, objectKey: string, colPos: number, inputId: string, fInputType?: string): void {
    console.log("[TableCodeFieldChanged] at rowPos: ", this.dbDataTable.data[rowPos]);

    let alreadyAdded = false;

    if (!!changedData && !!changedData.productGroupCode && changedData.productGroupCode.length > 0) {
      let _product: ProductGroup = { id: -1 } as ProductGroup;
      this.productGroupService.GetAll({ SearchString: changedData.productGroupCode }).subscribe({
        next: productGroups =>
        {
          if (!!productGroups && !!productGroups.data && productGroups.data.length > 0) {
            const productGroup = productGroups.data[0];
            console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', productGroup);

            if (!!productGroup && !!productGroup?.productGroupCode) {
              _product = productGroup;

              var alreadyAdded = false;
              this.dbDataTable.data.map((x, itemIndex) => {
                if (x.data?.productGroupID === _product.id && itemIndex !== index) {
                  alreadyAdded = true;
                }
              });
              if (alreadyAdded) {
                this.dbDataTable.data[rowPos].data.Restore('productGroupCode');
                HelperFunctions.SelectBeginningByClass(SelectFirstCharClass, 0, true, this.dbDataTable.data[rowPos].data.productGroupCode);
                // debugger;
                this.bbxToastrService.show(
                  Constants.MSG_PRODUCT_ALREADY_THERE,
                  Constants.TITLE_ERROR,
                  Constants.TOASTR_ERROR
                );
                return;
              } else {

                changedData.productGroupCode = productGroup.productGroupCode;
                changedData.productGroup = productGroup.productGroupDescription;
                changedData.productGroupID = productGroup.id;

                let currentRow = this.dbDataTable.FillCurrentlyEditedRow({ data: changedData });
                currentRow?.data.Save('productGroupCode');

                this.kbS.setEditMode(KeyboardModes.NAVIGATION);
                this.dbDataTable.MoveNextInTable();
                setTimeout(() => {
                  this.kbS.setEditMode(KeyboardModes.EDIT);
                  this.kbS.ClickCurrentElement();
                }, 200);
              }
              return;
            }
          }
          this.bbxToastrService.show(
            Constants.MSG_NO_PRODUCT_GROUP_FOUND,
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
          this.dbDataTable.data[rowPos].data.Restore('productGroupCode');
        },
        error: () => {
          this.dbDataTable.data[rowPos].data.Restore('productGroupCode');
          this.RecalcNetAndVat();
        },
        complete: () => {
          this.isLoading = false;

          if (_product.id === undefined || _product.id === -1 || alreadyAdded) {
            return;
          }
        }
      });
    }
  }

  protected RoundPrices(rowPos: number): void {
    if ((this.dbData.length + 1) <= rowPos) {
      return;
    }
    const d = this.dbData[rowPos]?.data;
    if (!!d) {
      d.Round();
    }
  }

  TableRowDataChanged(changedData?: any, index?: number, col?: string): void {
    if (!!changedData && !!changedData.productCode) {
      if ((!!col && col === 'productCode') || col === undefined) {
        this.productGroupService.Get({ ID: this.productGroups.find(x => x.productGroupCode === changedData.productGroupCode)?.id ?? -1 }).subscribe({
          next: productGroup => {
            console.log('[TableRowDataChanged]: ', changedData, ' | Product: ', productGroup);

            if (index !== undefined) {
              let tmp = this.dbData[index].data;

              tmp.productGroupID = productGroup.id ?? -1;

              this.dbData[index].data = tmp;

              this.dbDataDataSrc.setData(this.dbData);
            }

            this.RecalcNetAndVat();
          },
          error: () => {
            this.RecalcNetAndVat();
          }
        });
      }
    }
  }

  CheckSaveConditionsAndSave(): void {
    this.buyerForm.markAllAsTouched();

    if (this.buyerForm.invalid) {
      this.bbxToastrService.show(
        `Nincs kiválasztva partner.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
      return;
    }
    // if (this.dbData.find(x => !x.data.IsUnfinished()) === undefined) {
    //   this.bbxToastrService.show(
    //     `Legalább egy érvényesen megadott tétel szükséges a mentéshez.`,
    //     Constants.TITLE_ERROR,
    //     Constants.TOASTR_ERROR
    //   );
    //   return;
    // }
    const _dbData = this.dbData.slice(0, this.dbData.length - 1);
    this.productGroupService.GetAll(this.ProductGroupGetAllParams).subscribe({
      next: (data) => {
        if (!!data) {
          this.productGroups = data.data ?? [];

          if (_dbData.find(x => this.productGroups.find(y => y.id === x.data.productGroupID) === undefined || x.data.discount === undefined) !== undefined) {
            this.bbxToastrService.show(
              `Néhány tétel hiányosan vagy hibásan van megadva.`,
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          } else {
            this.Save();
          }
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  protected SetCustomerFormFields(data?: Customer) {
    console.log('SetCustomerFormFields: ', data);
    if (data === undefined) {
      this.buyerForm.controls['customerName'].setValue(undefined);
      this.buyerForm.controls['customerAddress'].setValue(undefined);
      this.buyerForm.controls['customerTaxNumber'].setValue(undefined);
      return;
    }
    this.buyerForm.controls['customerName'].setValue(data.customerName);
    let address = "";
    if (data.postalCode !== undefined && data.city !== undefined && data.postalCode !== null && data.city !== null) {
      address = data.postalCode + ', ' + data.city;
    } else if (data.postalCode !== undefined && data.postalCode !== null) {
      address = data.postalCode;
    } else if (data.city !== undefined && data.city !== null) {
      address = data.city;
    }
    this.buyerForm.controls['customerAddress'].setValue(address);
    this.buyerForm.controls['customerTaxNumber'].setValue(data.taxpayerNumber);
  }

  protected PrepareCustomer(data: Customer): Customer {
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
                this.SetDataForForm(res);
              }
            },
            error: err => {
              this.cs.HandleError(err);
            }
          });
        } else {
          this.bbxToastrService.show(res.errors!.join('\n'), Constants.TITLE_ERROR, Constants.TOASTR_ERROR);
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
      IsOwnData: false, PageNumber: '1', PageSize: '1', SearchString: this.customerInputFilterString, OrderBy: 'customerName'
    } as GetCustomersParamListModel).subscribe({
      next: res => {
        if (!!res && res.data !== undefined && res.data.length > 0) {
          this.buyerData = res.data[0];
          this.cachedCustomerName = res.data[0].customerName;
          this.SetCustomerFormFields(res.data[0]);
          this.searchByTaxtNumber = false;
        } else {
          if (this.customerInputFilterString.length >= 8 &&
            HelperFunctions.IsNumber(this.customerInputFilterString)) {
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

  SetGlobalDiscount(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    const dialogRef = this.dialogService.open(OneNumberInputDialogComponent, {
      context: {
        title: 'Kedvezmény megadása összes sorra',
        inputLabel: 'Kedvezmény %',
        numberInputMask: this.offerDiscountInputMask,
        placeHolder: '0.00'
      }
    });
    dialogRef.onClose.subscribe({
      next: res => {
        if (res.answer) {
          this.dbData.forEach(x => {
            x.data.Discount = HelperFunctions.ToFloat(res.value);
          })
        }
      }
    });
  }

  LoadRemainingProductGroups(): void {
    this.isLoading = true;
    this.productGroupService.GetAll(this.ProductGroupGetAllParams).subscribe({
      next: (data) => {
        if (!!data) {
          this.productGroups = (data.data ?? []).filter(x => !!x.productGroupCode.trim());

          this.productGroups.forEach(pg => {
            console.log("ProductGroup: ", pg);

            if (this.dbData.find(x => x.data.productGroupCode === pg.productGroupCode) === undefined) {
              let newItem = new CustDiscount();
              newItem.Discount = 0;
              newItem.productGroupCode = pg.productGroupCode;
              newItem.productGroup = pg.productGroupDescription;
              newItem.productGroupID = pg.id;
              newItem.customerID = this.buyerData?.id ?? -1;

              this.dbData.splice(0, 0, { data: newItem });
            }
          });

          this.dbData.sort((a, b) => {
            var n1 = a.data.ProductGroupCode;
            var n2 = b.data.ProductGroupCode;
            if (n1 > n2) {
              return 1;
            }
            if (n1 < n2) {
              return -1;
            }
            return 0;
          });

          this.dbData.forEach(x => {
            x.data.Save('productGroupCode');
          });

          this.dbDataDataSrc.setData(this.dbData);
          this.table?.renderRows();
          this.RefreshTable();
        }
      },
      error: (err) => {
        this.cs.HandleError(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /////////////////////////////////////////////
  ////////////// KEYBOARD EVENTS //////////////
  /////////////////////////////////////////////

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
      if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return;
      }
      this.CheckSaveConditionsAndSave();
      return;
    }
    this.HandleKeyDown(event);
  }

  public override HandleKeyDown(event: Event | TableKeyDownEvent, isForm: boolean = false): void {
    if (isTableKeyDownEvent(event)) {
      let _event = event.Event;
      switch (_event.key) {
        case this.KeySetting[Actions.Delete].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          HelperFunctions.confirm(this.dialogService, HelperFunctions.StringFormat(Constants.MSG_CONFIRMATION_DELETE_PARAM, event.Row.data), () => {
            this.dbDataTable?.HandleGridDelete(_event, event.Row, event.RowPos, event.ObjectKey)
          });
          break;
        }
        case this.KeySetting[Actions.Search].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(_event);
            return;
          }
          _event.preventDefault();
          this.ChooseDataForTableRow(event.RowPos, event.WasInNavigationMode);
          break;
        }
        case KeyBindings.Enter: {
          if (!this.isSaveInProgress && _event.ctrlKey && _event.key == 'Enter' && this.KeySetting[Actions.CloseAndSave].KeyCode === KeyBindings.CtrlEnter) {
            if (!this.kbS.IsCurrentNavigatable(this.dbDataTable) || this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
              _event.preventDefault();
              _event.stopImmediatePropagation();
              _event.stopPropagation();
              return;
            }
            this.CheckSaveConditionsAndSave();
            return;
          }
          break;
        }
      }
    }
    else {
      switch ((event as KeyboardEvent).key) {
        case this.KeySetting[Actions.Search].KeyCode: {
          if (!isForm) {
            return;
          }
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            HelperFunctions.StopEvent(event);
            return;
          }
          event.preventDefault();
          this.ChooseDataForForm();
          break;
        }
        case this.KeySetting[Actions.ToggleAllDiscounts].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          this.CopyDiscounts();
          break;
        }
        case this.KeySetting[Actions.SetGlobalDiscount].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          this.SetGlobalDiscount();
          break;
        }
        case this.KeySetting[Actions.Create].KeyCode: {
          if (this.khs.IsDialogOpened || this.khs.IsKeyboardBlocked) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          HelperFunctions.confirm(this.dialogService, Constants.MSG_LOAD_REMAINING_TSC, () => {
            this.LoadRemainingProductGroups();
          });
          break;
        }
      }
    }
  }

}
