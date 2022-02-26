import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductManagerComponent } from './product-manager/product-manager.component';
import { ProductSideBarFormComponent } from './product-side-bar-form/product-side-bar-form.component';



@NgModule({
  declarations: [
    ProductManagerComponent,
    ProductSideBarFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProductManagerComponent
  ]
})
export class ProductModule { }
