import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './error404/error404.component';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { UserManagerComponent } from './modules/auth/user-manager/user-manager.component';
import { DashboardComponent } from './modules/core/dashboard/dashboard.component';
import { CounterManagerComponent } from './modules/counter/counter-manager/counter-manager.component';
import { CustomerManagerComponent } from './modules/customer/customer-manager/customer-manager.component';
import { InvoiceManagerComponent } from './modules/invoice/invoice-manager/invoice-manager.component';
import { InvoiceNavComponent } from './modules/invoice/invoice-nav/invoice-nav.component';
import { OfferNavComponent } from './modules/offer/offer-nav/offer-nav.component';
import { OriginManagerComponent } from './modules/origin/origin-manager/origin-manager.component';
import { ProductGroupManagerComponent } from './modules/product-group/product-group-manager/product-group-manager.component';
import { ProductManagerComponent } from './modules/product/product-manager/product-manager.component';
import { WareHouseManagerComponent } from './modules/warehouse/ware-house-manager/ware-house-manager.component';

const routes: Routes = [
  {
    path: 'home',
    component: DashboardComponent
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: "user",
        component: UserManagerComponent,
      }
    ]
  },
  {
    path: 'manage',
    canActivate: [AuthGuard],
    children: [
      {
        path: "customers",
        component: CustomerManagerComponent,
      },
      {
        path: "product-group",
        component: ProductGroupManagerComponent,
      },
      {
        path: "origin",
        component: OriginManagerComponent,
      },
      {
        path: "product",
        component: ProductManagerComponent,
      },
      {
        path: "warehouse",
        component: WareHouseManagerComponent,
      },
      {
        path: "counter",
        component: CounterManagerComponent,
      },
    ]
  },
  {
    path: 'invoice',
    canActivate: [AuthGuard],
    children: [
      {
        path: "invoice",
        component: InvoiceManagerComponent,
      }
    ]
  },
  {
    path: 'product',
    canActivate: [AuthGuard],
    children: [
      {
        path: "offers-nav",
        component: OfferNavComponent,
      }
    ]
  },
  {
    path: 'information',
    canActivate: [AuthGuard],
    children: [
      {
        path: "invoices",
        component: InvoiceNavComponent,
      }
    ]
  },
  // otherwise redirect to stations
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
