import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbTable, NbTreeGridDataSource, NbSortDirection, NbDialogService, NbTreeGridDataSourceBuilder, NbToastrService, NbSortRequest, NbGlobalPhysicalPosition } from '@nebular/theme';
import { Observable, of, startWith, map } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { InlineEditableNavigatableTable } from 'src/assets/model/navigation/InlineEditableNavigatableTable';
import { AttachDirection, NavigatableForm as InlineTableNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { Customer } from '../../customer/models/Customer';
import { CustomerService } from '../../customer/services/customer.service';
import { Product } from '../../product/models/Product';
import { BaseInlineManagerComponent } from '../../shared/base-inline-manager/base-inline-manager.component';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { CreateOutgoingInvoiceRequest } from '../models/CreateOutgoingInvoiceRequest';
import { Invoice } from '../models/Invoice';
import { InvoiceLine } from '../models/InvoiceLine';
import { PaymentMethod } from '../models/PaymentMethod';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-invoice-manager',
  templateUrl: './invoice-manager.component.html',
  styleUrls: ['./invoice-manager.component.scss']
})
export class InvoiceManagerComponent extends BaseInlineManagerComponent<InvoiceLine> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('table') table?: NbTable<any>;

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  senderData: Customer;
  buyerData: Customer;

  buyersData: Customer[] = [];
  paymentMethods: PaymentMethod[] = [];

  outGoingInvoiceData: CreateOutgoingInvoiceRequest;

  filteredBuyerOptions$: Observable<string[]> = of([]);
  paymentMethodOptions$: Observable<string[]> = of([]);

  override colsToIgnore: string[] = ["Value"];
  override allColumns = ['productCode', 'quantity', 'lineNetAmount', 'price', 'Value'];
  override colDefs: ModelFieldDescriptor[] = [
    { label: 'Termékkód', objectKey: 'productCode', colKey: 'productCode', defaultValue: '', type: 'string', mask: "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", colWidth: "20%", textAlign: "left" },
    //{ label: 'Megnevezés', objectKey: 'Name', colKey: 'Name', defaultValue: '', type: 'string', mask: "", colWidth: "30%", textAlign: "left" },
    { label: 'Mértékegység', objectKey: 'quantity', colKey: 'quantity', defaultValue: '', type: 'string', mask: "", colWidth: "5%", textAlign: "left" },
    { label: 'Mennyiség', objectKey: 'lineNetAmount', colKey: 'lineNetAmount', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
    { label: 'Ár', objectKey: 'price', colKey: 'price', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
    { label: 'Érték', objectKey: 'Value', colKey: 'Value', defaultValue: '', type: 'number', mask: "", colWidth: "15%", textAlign: "right" },
  ]
  customMaskPatterns = {
    A: { pattern: new RegExp('[a-zA-Z0-9]') },
    C: { pattern: new RegExp('[a-zA-Z0-9]') }
  };

  override readonly commands: FooterCommandInfo[] = [
    { key: 'F1', value: 'Súgó', disabled: false },
    { key: 'F2', value: 'Keresés', disabled: false },
    { key: 'F3', value: 'Új Partner', disabled: false },
    { key: 'F4', value: 'Számolás', disabled: false },
    { key: 'F5', value: 'Adóalany', disabled: false },
    { key: 'F6', value: 'Módosítás', disabled: false },
    { key: 'F7', value: 'GdprNy', disabled: false },
    { key: 'F8', value: 'GdprAd', disabled: false },
    { key: 'F9', value: '', disabled: false },
    { key: 'F10', value: '', disabled: false },
  ];

  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  exporterForm: FormGroup;

  outInvForm: FormGroup;
  outInvFormId: string = "outgoing-invoice-form";
  outInvFormNav: InlineTableNavigatableForm;

  buyerForm: FormGroup;
  buyerFormId: string = "buyer-form";
  buyerFormNav: InlineTableNavigatableForm;  

  private tabIndex = 10000;
  get NextTabIndex() { return this.tabIndex++; }

  readonly navigationMatrix: string[][] = [
    ["r00"],
    ["m00", "m01", "m02", "m03"],
    ["m11"],
  ];

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvoiceLine>>,
    private seInv: InvoiceService,
    private seC: CustomerService,
    private seW: WareHouseService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    cs: CommonService,
    sts: StatusService
  ) {
    super(dialogService, kbS, fS, cs, sts);
    this.dbDataTableId = "invoice-inline-table-invoice-line";

    // Init form and table content - empty
    this.senderData = {} as Customer;
    this.buyerData = {} as Customer;
    
    this.outGoingInvoiceData = {} as CreateOutgoingInvoiceRequest;

    this.dbData = [];
    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    // Init forms
    this.exporterForm = new FormGroup({
      customerName: new FormControl('', []),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      comment: new FormControl('', []),
    });
    this.outInvForm = new FormGroup({
      paymentMethod: new FormControl('', []),
      invoiceDeliveryDate: new FormControl('', []),
      invoiceIssueDate: new FormControl('', []),
      paymentDate: new FormControl('', []),
      invoiceOrdinal: new FormControl('K-0000001/21', []),
      notice: new FormControl('', []),
    });
    this.buyerForm = new FormGroup({
      customerName: new FormControl('', []),
      zipCodeCity: new FormControl('', []),
      additionalAddressDetail: new FormControl('', []),
      customerBankAccountNumber: new FormControl('', []),
      taxpayerNumber: new FormControl('', []),
      comment: new FormControl('', []),
    });

    this.buyerFormNav = new InlineTableNavigatableForm(
      this.buyerForm,
      this.kbS,
      this.cdref,
      this.buyersData,
      this.buyerFormId,
      AttachDirection.DOWN
    );

    this.outInvFormNav = new InlineTableNavigatableForm(
      this.outInvForm,
      this.kbS,
      this.cdref,
      this.buyersData,
      this.outInvFormId,
      AttachDirection.DOWN
    );

    this.dbDataTable = new InlineEditableNavigatableTable(
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      () => {
        return new InvoiceLine();
      }
    );

    this.dbDataTable!.OuterJump = true;
    this.buyerFormNav!.OuterJump = true;
    this.outInvFormNav!.OuterJump = true;

    // Refresh data
    this.refresh();
  }

  refresh(): void {
    this.seC.GetAll({ IsOwnData: false }).subscribe({
      next: d => {
        // Possible buyers
        this.buyersData = d.data!;
        this.buyerFormNav.Setup(this.buyersData);
        console.log('Buyers: ', d);

        // Set filters
        this.filteredBuyerOptions$ = this.buyerForm.controls['customerName'].valueChanges
          .pipe(
            startWith(''),
            map((filterString: any) => this.filterBuyers(filterString)),
          );

        // Products
        this.dbData = [];
        this.dbDataDataSrc.setData(this.dbData);

        this.paymentMethodOptions$ = this.seInv.GetPaymentMethods().pipe(map(data => data.map(d => d.paymentMethodDescription)));

        this.seC.GetAll({ IsOwnData: true }).subscribe({
          next: d => {
            // Exporter form
            this.senderData = d.data?.filter(x => x.isOwnData)[0] ?? {} as Customer;
            console.log('Exporter: ', d);
            this.exporterForm = new FormGroup({
              customerName: new FormControl(this.senderData.customerName, []),
              zipCodeCity: new FormControl(this.senderData.postalCode + ' ' + this.senderData.city, []),
              additionalAddressDetail: new FormControl(this.senderData.additionalAddressDetail, []),
              customerBankAccountNumber: new FormControl(this.senderData.customerBankAccountNumber, []),
              taxpayerNumber: new FormControl(this.senderData.taxpayerNumber, []),
              comment: new FormControl(this.senderData.comment, []),
            });

            this.table?.renderRows();
            this.RefreshTable();

            this.isLoading = false;
          },
          error: (err) => {
            this.cs.HandleError(err); this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
            // this.Refresh();
          },
        });
      },
      error: (err) => {
        this.cs.HandleError(err); this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        // this.Refresh();
      },
    });
  }

  private filterBuyers(value: string): string[] {
    if (this.isEditModeOff) {
      return [];
    }
    const filterValue = value.toLowerCase();
    return [""].concat(this.buyersData.map(x => x.customerName).filter(optionValue => optionValue.toLowerCase().includes(filterValue)));
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.buyerFormNav.GenerateAndSetNavMatrices(true);
    this.outInvFormNav.GenerateAndSetNavMatrices(true);
    
    this.dbDataTable?.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore,
      'PRODUCT'
    );
    this.dbDataTable?.GenerateAndSetNavMatrices(true);
    this.dbDataTable?.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log("Detach");
    this.kbS.Detach();
  }

  // handleAutoCompleteOptionFocused(event: any): void {
  //   console.log(event);
  // }

  // private feelBuyerForm(name: string) {
  //   let buyer = this.buyersData.find(b => b.Name === name);
  //   if (!!buyer) {
  //     this.buyerForm.controls["zipCodeCity"].setValue(buyer.ZipCodeCity);
  //     this.buyerForm.controls["street"].setValue(buyer.Address);
  //     this.buyerForm.controls["invoiceNum"].setValue(buyer.InvoiceAddress);
  //     this.buyerForm.controls["taxNum"].setValue(buyer.TaxNumber);
  //     this.buyerForm.controls["note"].setValue(buyer.Note);
  //   }
  // }

  // handleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
  //   console.log("FORM HANDLING KEYBOARD ACTION");
  //   if (toggleEditMode) {
  //     this.kbS.toggleEdit();
  //   }
  //   if (jumpNext) {
  //     let oldMy = this.kbS.worldPos.Y;
  //     this.kbS.moveNextInForm();
  //     // TODO: navigációs mátrixhoz típust rendelni, pl. "táblázat"
  //     if (oldMy < this.kbS.worldPos.Y) {
  //       console.log(this.kbS.getCurrentTile());
  //       this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  //       this.dbDataTable.handleGridEnter(this.productsData[0], 0, this.colDefs[0].objectKey, 0);
  //     } else {
  //       this.kbS.clickCurrentTile();
  //       if (this.isEditModeOff) {
  //         this.kbS.toggleEdit();
  //       }
  //     }
  //   }
  // }

  // handleAutoCompleteSelect(event: any): void {
  //   if (event === "") {
  //     // this.buyerForm.controls["name"].setValue("");
  //     this.buyerForm.controls["zipCodeCity"].setValue("");
  //     this.buyerForm.controls["street"].setValue("");
  //     this.buyerForm.controls["invoiceNum"].setValue("");
  //     this.buyerForm.controls["taxNum"].setValue("");
  //     this.buyerForm.controls["note"].setValue("");
  //   } else {
  //     this.feelBuyerForm(event);
  //   }
  //   if (this.isEditModeOff) {
  //     let oldMy = this.kbS.worldPos.Y;
  //     this.kbS.moveNextInForm();
  //     // TODO: navigációs mátrixhoz típust rendelni, pl. "táblázat"
  //     if (oldMy < this.kbS.worldPos.Y) {
  //       console.log(this.kbS.getCurrentTile());
  //       this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  //       this.dbDataTable.handleGridEnter(this.productsData[0], 0, this.colDefs[0].objectKey, 0);
  //     } else {
  //       this.kbS.clickCurrentTile();
  //       this.kbS.toggleEdit();
  //     }
  //   }
  // }

  // handleActiveProductModalSelection(): void {
  //   if (this.tableIsFocused && !this.isEditModeOff) {
  //     const dialogRef = this.dialogService.open(ActiveProductDialogComponent, { closeOnEsc: false });
  //     dialogRef.onClose.subscribe((res: TreeGridNode<Product>) => {
  //       if (!!res && !!res.data) {
  //         this.seInv.getProductByProductCode(res.data.ProductCode!).subscribe(resp => {
  //           if (!resp.IsError) {
  //             res.data = resp.Result[0];
  //             this.dbDataTable.fillCurrentlyEditedRow(res);
  //           } else {
  //             this.toastrService.show(
  //               resp.Message, `Hiba`,
  //               { preventDuplicates: true, duration: 1000, status: 'danger', position: NbGlobalPhysicalPosition.BOTTOM_LEFT }
  //             );
  //           }
  //         })
  //       }
  //       const row = this.dbDataTable.editedRow;
  //       const rowPos = this.dbDataTable.editedRowPos;
  //       const cel = this.dbDataTable.editedProperty;
  //       this.dbDataTable.clearEdit();
  //       if (!!row && rowPos !== undefined && cel !== undefined) {
  //         this.dbDataTable.handleGridEnter(row, rowPos, cel, this.colDefs.findIndex(x => x.objectKey === cel));
  //       } else {
  //         this.kbS.selectCurrentTile();
  //       }
  //       this.dbDataTable.pushFooterCommandList();
  //     });
  //   }
  // }
}
