import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseNavigatableComponentComponent } from './base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

import { NbLayoutModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbActionsModule, NbCheckboxModule, NbContextMenuModule, NbMenuModule, NbPopoverModule, NbTagModule, NbTooltipModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HeadLineComponent } from './head-line/head-line.component';
import { FlatDesignTableComponent } from './flat-design-table/flat-design-table.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CrudButtonsComponent } from './crud-buttons/crud-buttons.component';


@NgModule({
  declarations: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent,
    PaginatorComponent,
    CrudButtonsComponent
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
  ],
  exports: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent,
    PaginatorComponent,
    CrudButtonsComponent
  ],
  providers: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule { }
