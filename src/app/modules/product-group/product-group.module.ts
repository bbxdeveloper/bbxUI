import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGroupManagerComponent } from './product-group-manager/product-group-manager.component';
import { ProductGroupSideBarFormComponent } from './product-group-side-bar-form/product-group-side-bar-form.component';



@NgModule({
  declarations: [
    ProductGroupManagerComponent,
    ProductGroupSideBarFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProductGroupManagerComponent
  ]
})
export class ProductGroupModule { }
