import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbDatepickerModule, NbDialogModule, NbMenuModule, NbSidebarModule, NbToastrModule, NbSidebarService } from '@nebular/theme';
import { CoreModule } from './modules/core/core.module';
import { NgxElectronModule } from 'ngx-electron';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OriginModule } from './modules/origin/origin.module';
import { ProductModule } from './modules/product/product.module';
import { ProductGroupModule } from './modules/product-group/product-group.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { InputMaskModule } from '@ngneat/input-mask';
import { CounterModule } from './modules/counter/counter.module';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { Error404Component } from './error404/error404.component';
import { OfferModule } from './modules/offer/offer.module';
import { InfrastructureModule } from './modules/infrastructure/infrastructure.module';
import { StockModule } from './modules/stock/stock.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { authInterceptorProviders } from 'src/assets/util/auth.interceptor';
import { CustomerDiscountModule } from './modules/customer-discount/customer-discount.module';
import { LocationModule } from './modules/location/location.module';

registerLocaleData(localeFr, 'fr');

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    AppComponent,
    Error404Component
  ],
  imports: [
    // Default
    BrowserModule,
    AppRoutingModule,
    NgxElectronModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // Misc
    NgxMaskModule.forRoot(maskConfig),
    // Nebular
    NbLayoutModule,
    NbMenuModule.forRoot(),
    NbDialogModule.forRoot(),
    NbSidebarModule.forRoot(),
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbToastrModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbSidebarModule.forRoot(),
    // Custom
    SharedModule,
    AuthModule,
    CustomerModule,
    OriginModule,
    ProductGroupModule,
    ProductModule,
    WarehouseModule,
    InvoiceModule,
    CounterModule,
    OfferModule,
    InputMaskModule,
    CoreModule,
    InfrastructureModule,
    StockModule,
    InventoryModule,
    CustomerDiscountModule,
    LocationModule
  ],
  exports: [
    NbLayoutModule,
    NgxMaskModule
  ],
  providers: [
    NbSidebarService,
    Title,
    authInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
