import { Component, OnInit,Output ,Input } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Firestore, deleteDoc ,collectionData, collection } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboard = true;
  currentFeature = '';
  loggedIn = false;
  dashboardData = 'Y';
  constructor(firestore: Firestore,public afs:AngularFirestore) { }

  invoices:any;
  expenses:any;
  fuel:any;
  db = getFirestore();
  
  colRef = collection(this.db,'Invoices');
  q = query(this.colRef,orderBy('invoiceDate','desc'));

  colRefExpenses = collection(this.db,'Expenses');
  expensesQuery = query(this.colRefExpenses,orderBy('date','desc'));

  colRefTrucks = collection(this.db,'Trucks');
  trucksQuery = query(this.colRefTrucks,orderBy('truck_number','desc'));

  colRefFuel = collection(this.db,'Fuels');
  fuelQuery = query(this.colRefFuel,orderBy('date','desc'));

  revenueLastYear = 0;
  revenueLastMonth = 0;
  revenueThisMonth = 0;
  revenueThisYear = 0;

  trucks:any;

  expensesThisMonth = 0;
  expensesLastMonth = 0;
  expensesLastYear = 0;
  expensesThisYear = 0;

  gasExpenseThisMonth = 0;
  gasExpenseLastMonth = 0;
  gasExpenseThisYear = 0;
  gasExpenseLastYear: number = 0;

  invoicesPaidThisMonth = 0;
  invoicesPaidLastMonth = 0;

  invoicesLastMonth = 0;
  invoicesThisMonth = 0;
  invoicesThisYear = 0;
  invoicesLastYear = 0;

  ngOnInit(): void {
    console.log('DASHBOARD PAGE',this.invoices);
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.invoices = []
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id})
      })
      console.log('DASHBOARD PAGE',this.invoices);
      this.getInvoicesPaidThisMonth();
      this.getInvoicesPaidLastMonth();
      this.getInvoicesLastYear();
      this.getInvoicesThisYear();
      this.getRevenueLastMonth();
      this.getRevenueThisMonth();
      this.getRevenueThisYear();
      this.getRevenueLastYear();
    });

    onSnapshot(this.expensesQuery,(snapshot: { docs: any[]; }) => {
      this.expenses = []
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      });
      this.getExpensesLastMonth();
      this.getExpensesThisMonth();
      this.getExpensesThisYear();
      this.getExpensesLastYear();
    });

    onSnapshot(this.fuelQuery,(snapshot: { docs: any[]; }) => {
      this.fuel = []
      snapshot.docs.forEach( (doc) => {
        this.fuel.push({...doc.data(), id:doc.id})
      });
      this.getGasExpenseLastMonth();
      this.getGasExpenseThisMonth();
      this.getGasExpenseThisYear();
      this.getGasExpenseLastYear();
    });

    onSnapshot(this.trucksQuery,(snapshot: { docs: any[]; }) => {
      this.trucks = []
      snapshot.docs.forEach( (doc) => {
        this.trucks.push({...doc.data(), id:doc.id})
      });
    });
  }

  getExpensesThisMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesThisMonth+=parseInt(x.total);
      }
    });
  }

  getGasExpenseLastYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch) ){
        this.gasExpenseLastYear+=parseInt(x.total);
      }
    });
  }

  getGasExpenseThisYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.gasExpenseThisYear+=parseInt(x.total);
      }
    });
  }

  getGasExpenseLastMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth == 1){
      thisYear--;
      thisMonth = 12;
    }else{
      thisMonth--;
    }
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.gasExpenseLastMonth+=parseInt(x.total);
      }
    });
  }

  getGasExpenseThisMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth == 1){
      thisYear--;
      thisMonth = 12;
    }else{
      thisMonth--;
    }
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch) ){
        this.gasExpenseThisMonth+=parseInt(x.total);
      }
    });
  }

  getExpensesThisYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesThisYear+=parseInt(x.total);
      }
    });
  }

  getExpensesLastYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesLastYear+=parseInt(x.total);
      }
    });
  }
  
  getExpensesLastMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth == 1){
      thisYear--;
      thisMonth = 12;
    }else{
      thisMonth--;
    }
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesLastMonth+=parseInt(x.total);
      }
    });
  }

  getInvoicesPaidLastMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesThisMonth++;
        if(x.paidDate){
          this.invoicesPaidThisMonth++;
        }
      }
    });
  }

  getInvoicesPaidThisMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth == 1){
      thisYear--;
      thisMonth = 12;
    }else{
      thisMonth--;
    }
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesLastMonth++;
        if(x.paidDate){
          this.invoicesPaidLastMonth++;
        }
      }
    });
  }

  getInvoicesThisYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesThisYear++;
      }
    });
  }

  getInvoicesLastYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesLastYear++;
      }
    });
  }

  getRevenueThisMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueThisMonth+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueThisYear(){
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueThisYear+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueLastMonth(){
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
    if(thisMonth == 1){
      thisYear--;
      thisMonth = 12;
    }else{
      thisMonth--;
    }
    if(thisMonth<10){
      strMonth = '0'+thisMonth.toString();
    }else{
      strMonth = thisMonth.toString();
    }
    var dateSearch = thisYear+'-'+strMonth;
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueLastMonth+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueLastYear(){
    var thisYear = new Date().getFullYear();
    this.invoices.forEach((x: any) => {
      console.log(x.invoiceDate);
      if(x.invoiceDate.includes((thisYear-1).toString())){
        this.revenueLastYear+=parseInt(x.totalBilled);
      }
    });
    console.log('revenue last year',(thisYear-1).toString(),this.revenueLastYear);
  }

  test(){
    console.log(this.currentFeature);
  }

  currentFeatureChanged(x:any){
    console.log('currentFeatureChange parent',x);
    this.currentFeature = x;
  }
}
