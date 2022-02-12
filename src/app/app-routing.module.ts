import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagerComponent } from './modules/auth/user-manager/user-manager.component';
import { DashboardComponent } from './modules/core/dashboard/dashboard.component';
import { CustomerManagerComponent } from './modules/customer/customer-manager/customer-manager.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'admin',
    children: [
      {
        path: "users",
        component: UserManagerComponent,
      }
    ]
  },
  {
    path: 'manage',
    children: [
      {
        path: "customers",
        component: CustomerManagerComponent,
      }
    ]
  },
  // otherwise redirect to stations
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
