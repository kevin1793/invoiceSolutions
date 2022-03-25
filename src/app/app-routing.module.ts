import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateinvoiceComponent } from './pages/createinvoice/createinvoice.component';
import { InvoicetrackerComponent } from './pages/invoicetracker/invoicetracker.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UpdatelogComponent } from './pages/updatelog/updatelog.component';

const routes:Routes=[
  { path : 'home',component:LoginComponent },
  { path : 'login',component:LoginComponent },
  { path : 'invoicetracker',component:InvoicetrackerComponent },
  { path : 'createinvoice',component:CreateinvoiceComponent },
  { path : 'updatelog',component:UpdatelogComponent },
  { path : '',component:HomeComponent },
  { path : 'dashboard' ,component:DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
