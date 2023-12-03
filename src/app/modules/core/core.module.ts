import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatusAndSpinnerComponent } from './status-and-spinner/status-and-spinner.component';
import { HeaderComponent } from './header/header.component';
import { NbActionsModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbContextMenuModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbLayoutModule, NbMenuModule, NbMenuService, NbPopoverModule, NbProgressBarModule, NbSpinnerModule, NbTagModule, NbToggleModule, NbTooltipModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { SendDataToNavComponent } from './send-data-to-nav/send-data-to-nav.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    DashboardComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
    SendDataToNavComponent
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbContextMenuModule,
    NbActionsModule,
    NbEvaIconsModule,
    NbPopoverModule,
    NbButtonModule,
    NbCardModule,
    NbMenuModule,
    NbButtonModule,
    NbTagModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonGroupModule,
    NbDatepickerModule,
    NbFormFieldModule,
    NbInputModule,
    NgxMaskModule.forChild(),
    NbCheckboxModule,
    NbProgressBarModule,
    NbSpinnerModule,
    NbTooltipModule,
    SharedModule,
  ],
  exports: [
    DashboardComponent,
    StatusAndSpinnerComponent,
    HeaderComponent
  ],
  providers: [
    NbMenuService
  ]
})
export class CoreModule { }
