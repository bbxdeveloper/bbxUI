import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { UserManagerComponent } from './modules/auth/user-manager/user-manager.component';
import { DashboardComponent } from './modules/core/dashboard/dashboard.component';
import { CustomerManagerComponent } from './modules/customer/customer-manager/customer-manager.component';

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
        path: "users",
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
