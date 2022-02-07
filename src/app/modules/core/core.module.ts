import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatusAndSpinnerComponent } from './status-and-spinner/status-and-spinner.component';
import { HeaderComponent } from './header/header.component';
import { NbActionsModule, NbButtonGroupModule, NbButtonModule, NbCardModule, NbContextMenuModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbLayoutModule, NbMenuModule, NbMenuService, NbPopoverModule, NbTagModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FKeyButtonsRowComponent } from './fkey-buttons-row/fkey-buttons-row.component';
import { SideBarFormComponent } from './side-bar-form/side-bar-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';



@NgModule({
  declarations: [
    DashboardComponent,
    FKeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
    SideBarFormComponent,
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
    NgxMaskModule.forChild()
  ],
  exports: [
    DashboardComponent,
    FKeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
    SideBarFormComponent
  ],
  providers: [
    NbMenuService
  ]
})
export class CoreModule { }
