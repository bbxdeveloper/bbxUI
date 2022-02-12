import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerManagerComponent } from './customer-manager/customer-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule } from '@nebular/theme';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    CustomerManagerComponent
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
    SharedModule
  ],
  exports: [
    CustomerManagerComponent
  ],
  providers: []
})
export class CustomerModule { }
