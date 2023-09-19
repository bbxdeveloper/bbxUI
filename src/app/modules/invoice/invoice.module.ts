import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceManagerComponent } from './invoice-manager/invoice-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule, NbAutocompleteModule, NbRadioModule, NbToggleModule } from '@nebular/theme';
import { InputMaskModule } from '@ngneat/input-mask';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { ProductSelectTableDialogComponent } from '../shared/dialogs/product-select-table-dialog/product-select-table-dialog.component';
import { CustomerSelectTableDialogComponent } from './customer-select-table-dialog/customer-select-table-dialog.component';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';
import { InvoiceNavComponent } from './invoice-nav/invoice-nav.component';
import { TaxNumberSearchCustomerEditDialogComponent } from './tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { BbxComboBoxInvoiceComponent } from '../shared/bbx-combo-box-invoice/bbx-combo-box-invoice.component';
import { InvoiceIncomeManagerComponent } from './invoice-income-manager/invoice-income-manager.component';
import { InvoiceNavSideBarFormComponent } from './invoice-nav-side-bar-form/invoice-nav-side-bar-form.component';
import { SummaryInvoiceComponent } from './summary-invoice/summary-invoice.component';
import { CustomersHasPendingInvoiceComponent } from './customers-has-pending-invoice/customers-has-pending-invoice.component';
import { PendingDeliveryNotesSelectDialogComponent } from './pending-delivery-notes-select-dialog/pending-delivery-notes-select-dialog.component';
import { PendingDeliveryNotesByInvoiceNumberDialogComponent } from './pending-delivery-notes-by-invoice-number-dialog/pending-delivery-notes-by-invoice-number-dialog.component';
import { PriceReviewComponent } from './price-review/price-review.component';
import { GetPendingDeliveryNotesDialogComponent } from './get-pending-delivery-notes-dialog/get-pending-delivery-notes-dialog.component';
import { ReceiptManagerComponent } from './receipt-manager/receipt-manager.component';
import { ReceiptDataFormComponent } from './receipt-data-form/receipt-data-form.component';
import { CorrectionInvoiceComponent } from './correction-invoice/correction-invoice.component';
import { CorrectionInvoiceSelectionDialogComponent } from './correction-invoice-selection-dialog/correction-invoice-selection-dialog.component';
import { InvoiceItemsDialogComponent } from './invoice-items-dialog/invoice-items-dialog.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoicePriceChangeDialogComponent } from './invoice-price-change-dialog/invoice-price-change-dialog.component';
import { CustomerInvoiceSummaryFilterFormComponent } from './customer-invoice-summary/customer-invoice-summary-filter-form/customer-invoice-summary-filter-form.component';
import { CustomerInvoiceSummaryManagerComponent } from './customer-invoice-summary/customer-invoice-summary-manager/customer-invoice-summary-manager.component';
import { CustomerInvoiceSummarySideBarFormComponent } from './customer-invoice-summary/customer-invoice-summary-side-bar-form/customer-invoice-summary-side-bar-form.component';
import { BaseInvoiceManagerComponent } from './base-invoice-manager/base-invoice-manager.component';
import { InvoiceCustomerComponent } from './invoice-customer/invoice-customer.component';



@NgModule({
  declarations: [
    InvoiceManagerComponent,
    CustomerSelectTableDialogComponent,
    SaveDialogComponent,
    InvoiceNavComponent,
    TaxNumberSearchCustomerEditDialogComponent,
    InvoiceIncomeManagerComponent,
    InvoiceNavSideBarFormComponent,
    SummaryInvoiceComponent,
    CustomersHasPendingInvoiceComponent,
    PendingDeliveryNotesSelectDialogComponent,
    PendingDeliveryNotesByInvoiceNumberDialogComponent,
    PriceReviewComponent,
    GetPendingDeliveryNotesDialogComponent,
    ReceiptManagerComponent,
    ReceiptDataFormComponent,
    CorrectionInvoiceComponent,
    CorrectionInvoiceSelectionDialogComponent,
    InvoiceItemsDialogComponent,
    InvoiceFormComponent,
    InvoicePriceChangeDialogComponent,
    CustomerInvoiceSummaryFilterFormComponent,
    CustomerInvoiceSummaryManagerComponent,
    CustomerInvoiceSummarySideBarFormComponent,
    BaseInvoiceManagerComponent,
    InvoiceCustomerComponent,
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbCardModule,
    NbButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NbTreeGridModule,
    NbTabsetModule,
    NbButtonGroupModule,
    NbProgressBarModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbFormFieldModule,
    NbInputModule,
    NgxMaskModule.forChild(),
    NbContextMenuModule,
    NbActionsModule,
    NbEvaIconsModule,
    NbPopoverModule,
    NbMenuModule,
    NbTagModule,
    NbCheckboxModule,
    NbTooltipModule,
    AngularSplitModule,
    NbAutocompleteModule,
    SharedModule,
    InputMaskModule,
    NbRadioModule,
    NbToggleModule
  ],
  exports: [
    InvoiceManagerComponent,
    InvoiceNavComponent,
    TaxNumberSearchCustomerEditDialogComponent,
    CustomerSelectTableDialogComponent,
    InvoiceIncomeManagerComponent,
    SummaryInvoiceComponent,
    CustomerInvoiceSummaryManagerComponent
  ]
})
export class InvoiceModule { }
