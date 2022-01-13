import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatusAndSpinnerComponent } from './status-and-spinner/status-and-spinner.component';
import { HeaderComponent } from './header/header.component';
import { NbActionsModule, NbButtonModule, NbCardModule, NbContextMenuModule, NbLayoutModule, NbMenuModule, NbMenuService, NbPopoverModule, NbTagModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FKeyButtonsRowComponent } from './fkey-buttons-row/fkey-buttons-row.component';



@NgModule({
  declarations: [
    DashboardComponent,
    FKeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
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
  ],
  exports: [
    DashboardComponent,
    FKeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
  ],
  providers: [
    NbMenuService
  ]
})
export class CoreModule { }
