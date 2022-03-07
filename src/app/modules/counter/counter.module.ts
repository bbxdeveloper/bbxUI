import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterManagerComponent } from './counter-manager/counter-manager.component';
import { CounterSideBarFormComponent } from './counter-side-bar-form/counter-side-bar-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule, NbAutocompleteModule } from '@nebular/theme';
import { InputMaskModule } from '@ngneat/input-mask';
import { SharedModule } from '../shared/shared.module';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [
    CounterManagerComponent,
    CounterSideBarFormComponent
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
  ]
})
export class CounterModule { }
