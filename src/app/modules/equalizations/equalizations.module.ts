import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualizationCreatorComponent } from './equalization-manager/equalization-creator/equalization-creator.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule } from '@nebular/theme';
import { InputMaskModule } from '@ngneat/input-mask';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { EqualizationNavigationFilterFormComponent } from './equalization-navigation/equalization-navigation-filter-form/equalization-navigation-filter-form.component';
import { EqualizationNavigationManagerComponent } from './equalization-navigation/equalization-navigation-manager/equalization-navigation-manager.component';
import { EqualizationNavigationSideBarFormComponent } from './equalization-navigation/equalization-navigation-side-bar-form/equalization-navigation-side-bar-form.component';
import { UnbalancedInvoicesNavigationManagerComponent } from './unbalanced-invoices-navigation/unbalanced-invoices-navigation-manager/unbalanced-invoices-navigation-manager.component';
import { UnbalancedInvoicesNavigationFilterFormComponent } from './unbalanced-invoices-navigation/unbalanced-invoices-navigation-filter-form/unbalanced-invoices-navigation-filter-form.component';
import { InvoiceModule } from '../invoice/invoice.module';



@NgModule({
  declarations: [
    EqualizationCreatorComponent,
    EqualizationNavigationFilterFormComponent,
    EqualizationNavigationManagerComponent,
    EqualizationNavigationSideBarFormComponent,
    UnbalancedInvoicesNavigationManagerComponent,
    UnbalancedInvoicesNavigationFilterFormComponent
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
    SharedModule,
    AngularEditorModule,
    InputMaskModule,
    InvoiceModule
  ],
  exports: [
    EqualizationCreatorComponent,
    EqualizationNavigationManagerComponent,
    UnbalancedInvoicesNavigationManagerComponent,
  ]
})
export class EqualizationsModule { }
