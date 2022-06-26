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
import { ProductSelectTableDialogComponent } from './product-select-table-dialog/product-select-table-dialog.component';
import { CustomerSelectTableDialogComponent } from './customer-select-table-dialog/customer-select-table-dialog.component';
import { SaveDialogComponent } from './save-dialog/save-dialog.component';
import { InvoiceNavComponent } from './invoice-nav/invoice-nav.component';
import { TaxNumberSearchCustomerEditDialogComponent } from './tax-number-search-customer-edit-dialog/tax-number-search-customer-edit-dialog.component';
import { BbxComboBoxInvoiceComponent } from './bbx-combo-box-invoice/bbx-combo-box-invoice.component';
import { InvoiceIncomeManagerComponent } from './invoice-income-manager/invoice-income-manager.component';



@NgModule({
  declarations: [
    InvoiceManagerComponent,
    ProductSelectTableDialogComponent,
    CustomerSelectTableDialogComponent,
    SaveDialogComponent,
    InvoiceNavComponent,
    TaxNumberSearchCustomerEditDialogComponent,
    BbxComboBoxInvoiceComponent,
    InvoiceIncomeManagerComponent
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
    BbxComboBoxInvoiceComponent,
    InvoiceIncomeManagerComponent
  ]
})
export class InvoiceModule { }
