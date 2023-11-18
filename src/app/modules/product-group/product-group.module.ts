import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGroupManagerComponent } from './product-group-manager/product-group-manager.component';
import { ProductGroupSideBarFormComponent } from './product-group-side-bar-form/product-group-side-bar-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule, NbAutocompleteModule } from '@nebular/theme';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { InputMaskModule } from '@ngneat/input-mask';



@NgModule({
  declarations: [
    ProductGroupManagerComponent,
    ProductGroupSideBarFormComponent
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
    InputMaskModule
  ],
  exports: [
    ProductGroupManagerComponent
  ]
})
export class ProductGroupModule { }
