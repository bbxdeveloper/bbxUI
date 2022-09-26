import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule, NbAutocompleteModule, NbRadioModule, NbToggleModule } from '@nebular/theme';
import { InputMaskModule } from '@ngneat/input-mask';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { StockNavComponent } from './stock-nav/stock-nav.component';
import { StockCardNavComponent } from './stock-card-nav/stock-card-nav.component';
import { StockCardSideBarFormComponent } from './stock-card-side-bar-form/stock-card-side-bar-form.component';

@NgModule({
  declarations: [
    StockNavComponent,
    StockCardNavComponent,
    StockCardSideBarFormComponent
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
    NbToggleModule,
    InvoiceModule,
    HttpClientModule,
    AngularEditorModule,
  ],
  exports: [
    StockNavComponent,
    StockCardNavComponent
  ]
})
export class StockModule { }
