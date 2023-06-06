import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseNavigatableComponentComponent } from './base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from './simple-dialogs/confirmation-dialog/confirmation-dialog.component';

import { NbLayoutModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbActionsModule, NbCheckboxModule, NbContextMenuModule, NbMenuModule, NbPopoverModule, NbTagModule, NbTooltipModule, NbSelectModule, NbIconModule, NbAutocompleteModule, NbRadioModule, NbToggleModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HeadLineComponent } from './head-line/head-line.component';
import { FlatDesignTableComponent } from './flat-design-table/flat-design-table.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CrudButtonsComponent } from './crud-buttons/crud-buttons.component';
import { FKeyButtonsRowComponent } from './fkey-buttons-row/fkey-buttons-row.component';
import { BaseManagerComponent } from './base-manager/base-manager.component';
import { BaseSideBarFormComponent } from './base-side-bar-form/base-side-bar-form.component';
import { FormControlErrorComponent } from './form-control-error/form-control-error.component';
import { InputMaskModule } from '@ngneat/input-mask';
import { RemoveWhitespacesPipe } from './pipes/remove-whitespaces.pipe';
import { BaseInlineManagerComponent } from './base-inline-manager/base-inline-manager.component';
import { SelectTableDialogComponent } from './select-table-dialog/select-table-dialog.component';
import { BaseNoFormManagerComponent } from './base-no-form-manager/base-no-form-manager.component';
import { BbxComboBoxComponent } from './bbx-combo-box/bbx-combo-box.component';
import { BbxTwoRowComboBoxComponent } from './bbx-two-row-combo-box/bbx-two-row-combo-box.component';
import { DateIntervalDialogComponent } from './simple-dialogs/date-interval-dialog/date-interval-dialog.component';
import { OneTextInputDialogComponent } from './simple-dialogs/one-text-input-dialog/one-text-input-dialog.component';
import { ToStringPipe } from './pipes/to-string.pipe';
import { ReplacePipe } from './pipes/replace.pipe';
import { OneNumberInputDialogComponent } from './simple-dialogs/one-number-input-dialog/one-number-input-dialog.component';
import { HtmlStringSanitizerPipe } from './pipes/html-string-sanitizer.pipe';
import { IframeViewerDialogComponent } from './simple-dialogs/iframe-viewer-dialog/iframe-viewer-dialog.component';
import { InlineEditableTableComponent } from './inline-editable-table/inline-editable-table.component';
import { OneButtonMessageDialogComponent } from './simple-dialogs/one-button-message-dialog/one-button-message-dialog.component';
import { CreateNewProductDialogComponent } from './create-new-product-dialog/create-new-product-dialog.component';
import { BbxCharCheckboxComponent } from './bbx-char-checkbox/bbx-char-checkbox.component';
import { RadioChoiceDialogComponent } from './simple-dialogs/radio-choice-dialog/radio-choice-dialog.component';
import { BbxComboBoxInvoiceComponent } from './bbx-combo-box-invoice/bbx-combo-box-invoice.component';
import { ProductSelectTableDialogComponent } from './product-select-table-dialog/product-select-table-dialog.component';
import { CustomerBankAccountNumberInputComponent } from './customer-bank-account-number-input/customer-bank-account-number-input.component';
import { CalculatorPopoverComponent } from './calculator-popover/calculator-popover.component';
import { InvoiceLayoutComponent } from './layouts/invoice-layout/invoice-layout.component';
import { InvoiceCustomerFormComponent } from './invoice-customer-form/invoice-customer-form.component';
import { InvoiceDataFormComponent } from './invoice-data-form/invoice-data-form.component';
import { InvoiceStyleLabelColumnComponent } from './invoice-style-label-column/invoice-style-label-column.component';
import { OneButtonConfirmationDialogComponent } from './simple-dialogs/one-button-confirmation-dialog/one-button-confirmation-dialog.component';
import { HozirontalSplitLayoutComponent } from './layouts/hozirontal-split-layout/hozirontal-split-layout.component';
import { VerticalSplitLayoutComponent } from './layouts/vertical-split-layout/vertical-split-layout.component';
import { SingleDateDialogComponent } from './simple-dialogs/single-date-dialog/single-date-dialog.component';


@NgModule({
  declarations: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent,
    PaginatorComponent,
    CrudButtonsComponent,
    FKeyButtonsRowComponent,
    BaseManagerComponent,
    BaseSideBarFormComponent,
    FormControlErrorComponent,
    RemoveWhitespacesPipe,
    BaseInlineManagerComponent,
    SelectTableDialogComponent,
    BaseNoFormManagerComponent,
    BbxComboBoxComponent,
    BbxTwoRowComboBoxComponent,
    DateIntervalDialogComponent,
    OneTextInputDialogComponent,
    ToStringPipe,
    ReplacePipe,
    OneNumberInputDialogComponent,
    HtmlStringSanitizerPipe,
    IframeViewerDialogComponent,
    InlineEditableTableComponent,
    OneButtonMessageDialogComponent,
    CreateNewProductDialogComponent,
    BbxCharCheckboxComponent,
    RadioChoiceDialogComponent,
    BbxComboBoxInvoiceComponent,
    ProductSelectTableDialogComponent,
    CustomerBankAccountNumberInputComponent,
    CalculatorPopoverComponent,
    InvoiceLayoutComponent,
    InvoiceCustomerFormComponent,
    InvoiceDataFormComponent,
    InvoiceStyleLabelColumnComponent,
    OneButtonConfirmationDialogComponent,
    HozirontalSplitLayoutComponent,
    VerticalSplitLayoutComponent,
    SingleDateDialogComponent
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
    NbActionsModule,
    NbContextMenuModule,
    NbEvaIconsModule,
    NbPopoverModule,
    NbMenuModule,
    NbTagModule,
    NbCheckboxModule,
    NbTooltipModule,
    InputMaskModule,
    NbSelectModule,
    NbIconModule,
    NbAutocompleteModule,
    NbRadioModule,
    NbToggleModule
  ],
  exports: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent,
    PaginatorComponent,
    CrudButtonsComponent,
    FKeyButtonsRowComponent,
    BaseManagerComponent,
    BaseSideBarFormComponent,
    FormControlErrorComponent,
    NbIconModule,
    RemoveWhitespacesPipe,
    BaseInlineManagerComponent,
    SelectTableDialogComponent,
    BaseNoFormManagerComponent,
    BbxComboBoxComponent,
    BbxTwoRowComboBoxComponent,
    ToStringPipe,
    ReplacePipe,
    OneNumberInputDialogComponent,
    HtmlStringSanitizerPipe,
    InlineEditableTableComponent,
    OneButtonMessageDialogComponent,
    CreateNewProductDialogComponent,
    BbxCharCheckboxComponent,
    RadioChoiceDialogComponent,
    BbxComboBoxInvoiceComponent,
    ProductSelectTableDialogComponent,
    CustomerBankAccountNumberInputComponent,
    CalculatorPopoverComponent,
    InvoiceLayoutComponent,
    InvoiceCustomerFormComponent,
    InvoiceDataFormComponent,
    InvoiceStyleLabelColumnComponent,
    HozirontalSplitLayoutComponent,
    VerticalSplitLayoutComponent,
    SingleDateDialogComponent,
  ],
  providers: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule { }
