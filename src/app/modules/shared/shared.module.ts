import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseNavigatableComponentComponent } from './base-navigatable-component/base-navigatable-component.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

import { NbLayoutModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { HeadLineComponent } from './head-line/head-line.component';
import { FlatDesignTableComponent } from './flat-design-table/flat-design-table.component';


@NgModule({
  declarations: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent
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
  ],
  exports: [
    BaseNavigatableComponentComponent,
    ConfirmationDialogComponent,
    HeadLineComponent,
    FlatDesignTableComponent
  ],
  providers: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule { }
