import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerManagerComponent } from './customer-manager/customer-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbActionsModule, NbCheckboxModule, NbContextMenuModule, NbMenuModule, NbPopoverModule, NbTagModule, NbTooltipModule } from '@nebular/theme';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { CustomerSideBarFormComponent } from './customer-side-bar-form/customer-side-bar-form.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';



@NgModule({
  declarations: [
    CustomerManagerComponent,
    CustomerSideBarFormComponent
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
    SharedModule,
  ],
  exports: [
    CustomerManagerComponent
  ],
  providers: []
})
export class CustomerModule { }
