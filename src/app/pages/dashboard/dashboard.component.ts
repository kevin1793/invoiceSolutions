import { Component, OnInit,Output ,Input } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Firestore, deleteDoc ,collectionData, collection } from '@angular/fire/firestore';
import { ChartConfiguration, ChartData, ChartOptions, ScatterDataPoint } from 'chart.js';
import { TemplateBindingParseResult } from '@angular/compiler';


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

  profitLastYear = 0;
  profitLastMonth = 0;
  profitThisMonth = 0;
  profitThisYear = 0;

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

  cachedData = true;
  

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['white'],
    datasets: [
      {
        data: [],
        label: 'All Revenue',
        fill: true,
        tension: 0.5,
        borderColor: 'white',
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false,
    color:'#222',
    scales: {
      y: {
        ticks: { color: '#222'},
        grid:{display:false}
      },
      x: {
        ticks: { color: '#22'},
        grid:{display:false}
      }
    }
  };
  public lineChartLegend = true;

  // START FUNCTIONS //

  ngOnInit(): void {
    var localDataPresent = this.checkLocalStorageData();
    if(localDataPresent){
      console.log('dashboard is getting local data');
      this.setLocalStorageData(); 
      this.getRevenueData();
      this.getExpenseData();
      this.getGasExpenseData();
      this.getChartData();
    }

    if(!localDataPresent){
      console.log('GETTING LIVE DATA');
      return;
      this.fetchDashboardData();
    }
  }

  refreshClicked(){
    this.fetchDashboardData();
    this.cachedData = false;
  }

  getChartData(){
    this.lineChartData.labels = this.invoices.map( (x: { invoiceDate: any; }) => x.invoiceDate).reverse();
    this.lineChartData.datasets[0].data = this.invoices.map( (x: { totalBilled: any; } ) => x.totalBilled).reverse();
  }

  fetchDashboardData(){
    console.log('getting invoice data');
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.invoices = [];
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id});
        this.getChartData();
      });
      this.getRevenueData();
      this.saveToLocalStorage('invoices',this.invoices);
    });


    console.log('getting exprenses data');
    onSnapshot(this.expensesQuery,(snapshot: { docs: any[]; }) => {
    this.expenses = [];
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      });
      this.getExpenseData();
      this.saveToLocalStorage('expenses',this.expenses);
    });


    console.log('getting fuel data');
    onSnapshot(this.fuelQuery,(snapshot: { docs: any[]; }) => {
      this.fuel = []
      snapshot.docs.forEach( (doc) => {
        this.fuel.push({...doc.data(), id:doc.id})
      });
      this.getGasExpenseData();
      this.saveToLocalStorage('fuel',this.fuel);
    });


    console.log('getting truck data');
    onSnapshot(this.trucksQuery,(snapshot: { docs: any[]; }) => {
      this.trucks = [];
      snapshot.docs.forEach( (doc) => {
        this.trucks.push({...doc.data(), id:doc.id})
      });
      this.saveToLocalStorage('trucks',this.trucks);
    });
  }

  getExpenseData(){
    this.getExpensesLastMonth();
    this.getExpensesThisMonth();
    this.getExpensesThisYear();
    this.getExpensesLastYear();
  }

  getGasExpenseData(){
    this.getGasExpenseLastMonth();
    this.getGasExpenseThisMonth();
    this.getGasExpenseThisYear();
    this.getGasExpenseLastYear();
    this.getProfitData();
  }

  getRevenueData(){
    this.getInvoicesPaidThisMonth();
    this.getInvoicesPaidLastMonth();
    this.getInvoicesLastYear();
    this.getInvoicesThisYear();
    this.getRevenueLastMonth();
    this.getRevenueThisMonth();
    this.getRevenueThisYear();
    this.getRevenueLastYear();
  }

  checkLocalStorageData(){
    var cachedInvoiceData = localStorage.getItem('invoices');
    var cachedFuelData = localStorage.getItem('fuel');
    if(cachedInvoiceData && JSON.parse(cachedInvoiceData).length > 0){
      this.invoices = JSON.parse(cachedInvoiceData);
      return true;
    }else{
      return false;
    }
  }

  setLocalStorageData(){
    var cachedTrucksData = localStorage.getItem('trucks');
    var cachedInvoicesData = localStorage.getItem('invoices');
    var cachedFuelData = localStorage.getItem('fuel');
    var cachedExpensesData = localStorage.getItem('expenses');

    if(cachedExpensesData?.length){
      this.expenses = JSON.parse(cachedExpensesData);
    }
    if(cachedFuelData?.length){
      this.fuel = JSON.parse(cachedFuelData);
    }
    if(cachedInvoicesData?.length){
      this.invoices = JSON.parse(cachedInvoicesData);
    }
    if(cachedTrucksData?.length){
      this.trucks = JSON.parse(cachedTrucksData);
    }
  }

  saveToLocalStorage(id: string,data: any){
    localStorage.setItem(id,JSON.stringify(data));
  }

  getProfitData(){
    this.profitThisYear = this.revenueThisYear - (this.gasExpenseThisYear+this.expensesThisYear);
    this.profitThisMonth = this.revenueThisMonth - (this.gasExpenseThisMonth+this.expensesThisMonth);
    this.profitLastMonth = this.revenueLastMonth - (this.gasExpenseLastMonth+this.expensesLastMonth);
    this.profitLastYear = this.revenueLastYear - (this.gasExpenseLastYear+this.expensesLastYear);
  }

  reloadChart(chart:any){
    chart.datasets[0].data.push(1);
    setTimeout(() => {
      chart.datasets[0].data.pop();
    },1100);
  }

  getGasExpenseLastYear(){
    this.gasExpenseLastYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch) ){
        this.gasExpenseLastYear+=parseInt(x.total);
      }
    });
  }

  getGasExpenseThisYear(){
    this.gasExpenseThisYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.fuel.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.gasExpenseThisYear+=parseInt(x.total);
      }
    });
  }

  getExpensesThisMonth(){
    this.expensesThisMonth = 0;
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

  getGasExpenseLastMonth(){
    this.gasExpenseLastMonth = 0;
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
    this.gasExpenseThisMonth = 0;
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth()+1;
    var strMonth = '';
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
    this.expensesThisYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesThisYear+=parseInt(x.total);
      }
    });
  }

  getExpensesLastYear(){
    this.expensesLastYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.expenses.forEach((x: any) => {
      if(x.date.includes(dateSearch)){
        this.expensesLastYear+=parseInt(x.total);
      }
    });
  }
  
  getExpensesLastMonth(){
    this.expensesLastMonth = 0;
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
    this.invoicesThisMonth = 0;
    this.invoicesPaidThisMonth = 0;
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
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesThisMonth++;
        if(x.paidDate){
          this.invoicesPaidThisMonth++;
        }
      }
    });
  }

  getInvoicesPaidThisMonth(){
    this.invoicesLastMonth = 0;
    this.invoicesPaidLastMonth = 0;
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
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesLastMonth++;
        if(x.paidDate){
          this.invoicesPaidLastMonth++;
        }
      }
    });
  }

  getInvoicesThisYear(){
    this.invoicesThisYear = 0;;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesThisYear++;
      }
    });
  }

  getInvoicesLastYear(){
    this.invoicesLastYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear-1;
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes(dateSearch)){
        this.invoicesLastYear++;
      }
    });
  }

  getRevenueThisMonth(){
    this.revenueThisMonth = 0;
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
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueThisMonth+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueThisYear(){
    this.revenueThisYear = 0;
    var thisYear = new Date().getFullYear();
    var dateSearch = thisYear;
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueThisYear+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueLastMonth(){
    this.revenueLastMonth = 0;
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
      if(x.invoiceDate.includes(dateSearch)){
        this.revenueLastMonth+=parseInt(x.totalBilled);
      }
    });
  }

  getRevenueLastYear(){
    this.revenueLastYear = 0;
    var thisYear = new Date().getFullYear();
    this.invoices.forEach((x: any) => {
      if(x.invoiceDate.includes((thisYear-1).toString())){
        this.revenueLastYear+=parseInt(x.totalBilled);
      }
    });
  }

  test(){
  }

  currentFeatureChanged(x:any){
    this.currentFeature = x;
  }
}
