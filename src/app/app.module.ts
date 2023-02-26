import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';

import * as firebase from 'firebase/app';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidemenuComponent } from './components/sidemenu/sidemenu.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InvoicetrackerComponent } from './pages/invoicetracker/invoicetracker.component';
import { CreateinvoiceComponent } from './pages/createinvoice/createinvoice.component';
import { CreateinvoiceloadComponent } from './pages/createinvoiceload/createinvoiceload.component';
import { TestComponent } from './components/test/test.component';
import { UpdatelogComponent } from './pages/updatelog/updatelog.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { TrucksComponent } from './pages/trucks/trucks.component';
import { FuelComponent } from './pages/fuel/fuel.component';
import { NgChartsModule } from 'ng2-charts';
import { InventoryComponent } from './pages/inventory/inventory.component';

firebase.initializeApp(environment.firebase);
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    SidemenuComponent,
    FooterComponent,
    LoginComponent,
    DashboardComponent,
    CreateinvoiceComponent,
    CreateinvoiceloadComponent,
    InvoicetrackerComponent,
    TestComponent,
    UpdatelogComponent,
    ExpensesComponent,
    NotfoundComponent,
    TrucksComponent,
    FuelComponent,
    InventoryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {path: 'dashboard', component: HomeComponent},
    ]),
    AppRoutingModule,
    ReactiveFormsModule,
    NgChartsModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())

    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
