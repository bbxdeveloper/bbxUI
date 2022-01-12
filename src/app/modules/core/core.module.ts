import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FkeyButtonsRowComponent } from './fkey-buttons-row/fkey-buttons-row.component';
import { StatusAndSpinnerComponent } from './status-and-spinner/status-and-spinner.component';
import { HeaderComponent } from './header/header.component';



@NgModule({
  declarations: [
    DashboardComponent,
    FkeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DashboardComponent,
    FkeyButtonsRowComponent,
    StatusAndSpinnerComponent,
    HeaderComponent,
  ]
})
export class CoreModule { }
