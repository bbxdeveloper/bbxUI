import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { UserManagerComponent } from './modules/auth/user-manager/user-manager.component';
import { DashboardComponent } from './modules/core/dashboard/dashboard.component';
import { CounterManagerComponent } from './modules/counter/counter-manager/counter-manager.component';
import { CustomerManagerComponent } from './modules/customer/customer-manager/customer-manager.component';
import { InvCtrlItemManagerComponent } from './modules/inventory/inv-ctrl-item-manager/inv-ctrl-item-manager.component';
import { InvCtrlPeriodManagerComponent } from './modules/inventory/inv-ctrl-period-manager/inv-ctrl-period-manager.component';
import { InvRowNavComponent } from './modules/inventory/inv-row-nav/inv-row-nav.component';
import { InvoiceIncomeManagerComponent } from './modules/invoice/invoice-income-manager/invoice-income-manager.component';
import { InvoiceManagerComponent } from './modules/invoice/invoice-manager/invoice-manager.component';
import { InvoiceNavComponent } from './modules/invoice/invoice-nav/invoice-nav.component';
import { OfferCreatorComponent } from './modules/offer/offer-creator/offer-creator.component';
import { OfferEditorComponent } from './modules/offer/offer-editor/offer-editor.component';
import { OfferNavComponent } from './modules/offer/offer-nav/offer-nav.component';
import { OriginManagerComponent } from './modules/origin/origin-manager/origin-manager.component';
import { ProductGroupManagerComponent } from './modules/product-group/product-group-manager/product-group-manager.component';
import { ProductManagerComponent } from './modules/product/product-manager/product-manager.component';
import { StockCardNavComponent } from './modules/stock/stock-card-nav/stock-card-nav.component';
import { StockNavComponent } from './modules/stock/stock-nav/stock-nav.component';
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
        path: "manage-products",
        component: ProductManagerComponent,
      },
      {
        path: "offers-nav",
        component: OfferNavComponent,
      },
      {
        path: "offers-create",
        component: OfferCreatorComponent,
      },
      {
        path: "offers-edit/:id",
        component: OfferEditorComponent,
      },
      {
        path: "invctrlperiod",
        component: InvCtrlPeriodManagerComponent,
      },
      {
        path: "invctrlicp",
        component: InvCtrlItemManagerComponent,
      },
      {
        path: "invrownav",
        component: InvRowNavComponent,
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
  {
    path: 'income',
    canActivate: [AuthGuard],
    children: [
      {
        path: "invoice-income",
        component: InvoiceIncomeManagerComponent,
      }
    ]
  },
  {
    path: 'stock',
    canActivate: [AuthGuard],
    children: [
      {
        path: "nav",
        component: StockNavComponent,
      }
    ]
  },
  {
    path: 'stock-card',
    canActivate: [AuthGuard],
    children: [
      {
        path: "nav",
        component: StockCardNavComponent,
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
