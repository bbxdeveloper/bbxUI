import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvCtrlPeriodManagerComponent } from './inv-ctrl-period-manager/inv-ctrl-period-manager.component';
import { InvCtrlPeriodSideBarFormComponent } from './inv-ctrl-period-side-bar-form/inv-ctrl-period-side-bar-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule, NbAutocompleteModule, NbRadioModule } from '@nebular/theme';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { InvCtrlItemManagerComponent } from './inv-ctrl-item-manager/inv-ctrl-item-manager.component';
import { InvRowNavComponent } from './inv-row-nav/inv-row-nav.component';
import { InvCtrlAbsentComponent } from './inv-ctrl-absent/inv-ctrl-absent.component';
import { ContInvCtrlComponent } from './cont-inv-ctrl/cont-inv-ctrl.component';



@NgModule({
  declarations: [
    InvCtrlPeriodManagerComponent,
    InvCtrlPeriodSideBarFormComponent,
    InvCtrlItemManagerComponent,
    InvRowNavComponent,
    InvCtrlAbsentComponent,
    ContInvCtrlComponent
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
    NbRadioModule,
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
  ]
})
export class InventoryModule { }
