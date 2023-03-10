import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateinvoiceComponent } from './pages/createinvoice/createinvoice.component';
import { CreateinvoiceloadComponent } from './pages/createinvoiceload/createinvoiceload.component';
import { InvoicetrackerComponent } from './pages/invoicetracker/invoicetracker.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UpdatelogComponent } from './pages/updatelog/updatelog.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { TrucksComponent } from './pages/trucks/trucks.component';
import { FuelComponent } from './pages/fuel/fuel.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { AuthGuardService } from './services/auth-guard.service';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AnnouncementsComponent } from './pages/announcements/announcements.component';
import { TasksComponent } from './pages/tasks/tasks.component';

const routes:Routes=[
  { path : '', component: HomeComponent, canActivate: [AuthGuardService] },
  { path : 'home',component:LoginComponent },
  { path : 'login',component:LoginComponent },
  { path : 'invoicetracker',component:InvoicetrackerComponent },
  { path : 'createinvoice',component:CreateinvoiceComponent },
  { path : 'createinvoiceload',component:CreateinvoiceloadComponent },
  { path : 'updatelog',component:UpdatelogComponent },
  { path : 'expenses',component:ExpensesComponent },
  { path : 'fuel',component:FuelComponent },
  { path : 'employees',component:EmployeesComponent },
  { path : 'inventory',component:InventoryComponent },
  { path : 'announcements',component:AnnouncementsComponent },
  { path : 'tasks',component:TasksComponent },
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
