import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatusAndSpinnerComponent } from './status-and-spinner/status-and-spinner.component';
import { HeaderComponent } from './header/header.component';
import { NbActionsModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbContextMenuModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbLayoutModule, NbMenuModule, NbMenuService, NbPopoverModule, NbTagModule, NbToggleModule, NbTooltipModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [
    DashboardComponent,
    StatusAndSpinnerComponent,
    HeaderComponent
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
    NbTooltipModule
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
