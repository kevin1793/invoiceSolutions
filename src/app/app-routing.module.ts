import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateinvoiceComponent } from './pages/createinvoice/createinvoice.component';
import { InvoicetrackerComponent } from './pages/invoicetracker/invoicetracker.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UpdatelogComponent } from './pages/updatelog/updatelog.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { TrucksComponent } from './pages/trucks/trucks.component';
import { FuelComponent } from './pages/fuel/fuel.component';

const routes:Routes=[
  { path : 'home',component:LoginComponent },
  { path : 'login',component:LoginComponent },
  { path : 'invoicetracker',component:InvoicetrackerComponent },
  { path : 'createinvoice',component:CreateinvoiceComponent },
  { path : 'updatelog',component:UpdatelogComponent },
  { path : 'expenses',component:ExpensesComponent },
  { path : 'fuel',component:FuelComponent },
  { path : 'trucks',component:TrucksComponent },
  { path : '',component:HomeComponent },
  { path : 'dashboard' ,component:DashboardComponent },
  { path : '404', component: NotfoundComponent },
  { path : '**', redirectTo: '/404' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
