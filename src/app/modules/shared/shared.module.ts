import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseNavigatableComponentComponent } from './base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

import { NbLayoutModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbActionsModule, NbCheckboxModule, NbContextMenuModule, NbMenuModule, NbPopoverModule, NbTagModule, NbTooltipModule, NbSelectModule, NbIconModule } from '@nebular/theme';
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
    NbIconModule
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
  ],
  providers: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule { }
