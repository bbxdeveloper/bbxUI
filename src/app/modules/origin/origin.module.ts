import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OriginManagerComponent } from './origin-manager/origin-manager.component';
import { OriginSideBarFormComponent } from './origin-side-bar-form/origin-side-bar-form.component';



@NgModule({
  declarations: [
    OriginManagerComponent,
    OriginSideBarFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OriginManagerComponent
  ]
})
export class OriginModule { }
