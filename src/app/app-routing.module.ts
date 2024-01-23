import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { NavigationGuard } from './modules/auth/guards/navigation.guard';
import { UserManagerComponent } from './modules/auth/user-manager/user-manager.component';
import { DashboardComponent } from './modules/core/dashboard/dashboard.component';
import { CounterManagerComponent } from './modules/counter/counter-manager/counter-manager.component';
import { CustomerDiscountManagerComponent } from './modules/customer-discount/customer-discount-manager/customer-discount-manager.component';
import { CustomerManagerComponent } from './modules/customer/customer-manager/customer-manager.component';
import { ContInvCtrlComponent } from './modules/inventory/cont-inv-ctrl/cont-inv-ctrl.component';
import { InvCtrlAbsentComponent } from './modules/inventory/inv-ctrl-absent/inv-ctrl-absent.component';
import { InvCtrlItemManagerComponent } from './modules/inventory/inv-ctrl-item-manager/inv-ctrl-item-manager.component';
import { InvCtrlPeriodManagerComponent } from './modules/inventory/inv-ctrl-period-manager/inv-ctrl-period-manager.component';
import { InvRowNavComponent } from './modules/inventory/inv-row-nav/inv-row-nav.component';
import { InvoiceIncomeManagerComponent } from './modules/invoice/invoice-income-manager/invoice-income-manager.component';
import { InvoiceManagerComponent } from './modules/invoice/invoice-manager/invoice-manager.component';
import { InvoiceNavComponent } from './modules/invoice/invoice-navigation/invoice-nav/invoice-nav.component';
import { PriceReviewComponent } from './modules/invoice/price-review/price-review.component';
import { ReceiptManagerComponent } from './modules/invoice/receipt-manager/receipt-manager.component';
import { SummaryInvoiceComponent } from './modules/invoice/summary-invoice/summary-invoice.component';
import { LocationManagerComponent } from './modules/location/location-manager/location-manager.component';
import { OfferCreatorComponent } from './modules/offer/offer-creator/offer-creator.component';
import { OfferEditorComponent } from './modules/offer/offer-editor/offer-editor.component';
import { OfferNavComponent } from './modules/offer/offer-nav/offer-nav.component';
import { OriginManagerComponent } from './modules/origin/origin-manager/origin-manager.component';
import { ProductGroupManagerComponent } from './modules/product-group/product-group-manager/product-group-manager.component';
import { ProductManagerComponent } from './modules/product/product-manager/product-manager.component';
import { StockCardNavComponent } from './modules/stock/stock-card-nav/stock-card-nav.component';
import { StockNavComponent } from './modules/stock/stock-nav/stock-nav.component';
import { WareHouseManagerComponent } from './modules/warehouse/ware-house-manager/ware-house-manager.component';
import { CorrectionInvoiceComponent } from './modules/invoice/correction-invoice/correction-invoice.component';
import { InbetweenWarehouseComponent } from './modules/warehouse/inbetween-warehouse/inbetween-warehouse.component';
import { WarehouseDocumentManagerComponent } from './modules/warehouse/warehouse-document/warehouse-document-manager/warehouse-document-manager.component';
import { CustomerInvoiceSummaryManagerComponent } from './modules/invoice/customer-invoice-summary/customer-invoice-summary-manager/customer-invoice-summary-manager.component';
import { EqualizationCreatorComponent } from './modules/equalizations/equalization-manager/equalization-creator/equalization-creator.component';
import { EqualizationNavigationManagerComponent } from './modules/equalizations/equalization-navigation/equalization-navigation-manager/equalization-navigation-manager.component';
import { UnbalancedInvoicesNavigationManagerComponent } from './modules/equalizations/unbalanced-invoices-navigation/unbalanced-invoices-navigation-manager/unbalanced-invoices-navigation-manager.component';

const routes: Routes = [
  {
    canDeactivate: [NavigationGuard],
    path: 'home',
    component: DashboardComponent
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
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
    canDeactivate: [NavigationGuard],
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
      {
        path: "location",
        component: LocationManagerComponent,
      },
    ]
  },
  {
    path: 'invoice',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: "invoice",
        component: InvoiceManagerComponent,
      },
      {
        path: "outgoing-delivery-note-income",
        component: InvoiceManagerComponent,
      },
      {
        path: "summary-invoice",
        component: SummaryInvoiceComponent,
      },
      {
        path: "minus-delivery-note",
        component: SummaryInvoiceComponent,
      },
      {
        path: 'price-review',
        component: PriceReviewComponent
      },
      {
        path: 'receipt',
        component: ReceiptManagerComponent
      },
      {
        path: 'correction-invoice',
        component: CorrectionInvoiceComponent
      },
    ]
  },
  {
    path: 'product',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
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
      }
    ]
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
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
      },
      {
        path: "invctrlabsent",
        component: InvCtrlAbsentComponent,
      },
      {
        path: "cont-invctrl",
        component: ContInvCtrlComponent,
      }
    ]
  },
  {
    path: 'information',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: "invoices",
        component: InvoiceNavComponent,
      },
      {
        path: "customerinvoicesummary",
        component: CustomerInvoiceSummaryManagerComponent,
      },
      {
        path: "unbalancedinvoicesnavigation",
        component: UnbalancedInvoicesNavigationManagerComponent,
      }
    ]
  },
  {
    path: 'income',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: "invoice-income",
        component: InvoiceIncomeManagerComponent,
      },
      {
        path: "incoming-delivery-note-income",
        component: InvoiceIncomeManagerComponent,
      },
      {
        path: "incoming-summary-invoice",
        component: SummaryInvoiceComponent,
      },
      {
        path: 'minus-incoming-delivery-note',
        component: SummaryInvoiceComponent,
      },
      {
        path: 'incoming-correction-invoice',
        component: CorrectionInvoiceComponent,
      }
    ]
  },
  {
    path: 'stock',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
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
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: "nav",
        component: StockCardNavComponent,
      }
    ]
  },
  {
    path: 'cust-discount',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: "manage",
        component: CustomerDiscountManagerComponent,
      }
    ]
  },
  {
    path: 'warehouse',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: 'inbetween-warehouse',
        component: InbetweenWarehouseComponent,
      },
      {
        path: "inbetween-warehouse-edit/:id",
        component: InbetweenWarehouseComponent,
      },
      {
        path: 'warehouse-document',
        component: WarehouseDocumentManagerComponent,
      }
    ]
  },
  {
    path: 'equalizations',
    canActivate: [AuthGuard],
    canDeactivate: [NavigationGuard],
    children: [
      {
        path: 'query-financial-equalizations',
        component: EqualizationNavigationManagerComponent,
      },
      {
        path: 'create-financial-equalization',
        component: EqualizationCreatorComponent,
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
