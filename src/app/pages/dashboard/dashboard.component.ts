import { Component, OnInit,Output ,Input } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { orderBy, query,onSnapshot,where, getFirestore } from 'firebase/firestore';
import { Firestore, deleteDoc ,collectionData, collection } from '@angular/fire/firestore';
import { ChartConfiguration, ChartData, ChartOptions, ScatterDataPoint } from 'chart.js';
import { TemplateBindingParseResult } from '@angular/compiler';
import { Router } from '@angular/router';


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
  constructor(firestore: Firestore,public afs:AngularFirestore,
    private router:Router) { }

  invoices:any;
  expenses:any;
  vehicles:any;
  tasks:any;
  fuel:any;
  lastUpdated:any;
  db = getFirestore();
  
  colRefExpenses = collection(this.db,'Expenses');
  expensesQuery = query(this.colRefExpenses,orderBy('date','desc'));

  colRefVehicles = collection(this.db,'Vehicles');
  vehiclesQuery = query(this.colRefVehicles,orderBy('vehicle_number','desc'));

  colRefFuel = collection(this.db,'Fuels');
  fuelQuery = query(this.colRefFuel,orderBy('date','desc'));

  last30DayData = {expenses:0,invoices:0,invoicesPaid:'',fuel:0,tasks:0,vehicles:'',lastUpdated:new Date()};
  localData = [];
  cachedData = true;
  

  public lineChartData: ChartConfiguration<'bar'>['data'] = {
    // labels: ['white'],
    datasets: [
      {
        data: [],
        label: 'Invoice Totals By Day (Last 30 Days)',
        // fill: true,
        // tension: 0.5,
        borderColor: 'white',
      }
    ]
  };
  public lineChartOptions: ChartOptions<'bar'> = {
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
    },
    plugins: {
      title: {
          display: true,
          text: 'Invoice Totals By Day'
      },
      legend:{
        display:false,

      }
    },
    
  };
  public pieChartData: any = {
    labels: [],
    
    datasets: [
      {
        label: 'Expenses By Category',
        data: [],
        // fill: true,
        // tension: 0.5,
        borderColor: 'white',
        hoverOffset: 4
      }
    ],
  };
  // public pieChartData: any = [10,20];
  // public pieChartLabels: string[] = [];
  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: false,
    plugins: {
      title: {
          display: true,
          text: 'Expenses By Category'
      }
    },
    color:'#222',
    // scales: {
    //   y: {
    //     ticks: { color: '#222'},
    //     grid:{display:false}
    //   },
    //   x: {
    //     ticks: { color: '#22'},
    //     grid:{display:false}
    //   }
    // }
  };
  
  public lineChartLegend = true;

  // START FUNCTIONS //

  ngOnInit(): void {
    var localDataPresent = this.checkLocalStorageData();
    if(localDataPresent){
      this.setDashboardLocalData();
    }else{
      this.fetchDashboardData();
    }
  }
  setDashboardLocalData(){
    console.log('localStorage',localStorage);
    this.invoices = JSON.parse(localStorage.getItem('invoices') || '');
    this.fuel = JSON.parse(localStorage.getItem('fuel') || '');
    this.expenses = JSON.parse(localStorage.getItem('expenses') || '');
    this.last30DayData = JSON.parse(localStorage.getItem('last30DayData') || '');
    this.getChartData();
    this.setExpenseChartData(this.expenses);
  }
  refreshClicked(){
    this.fetchDashboardData();
    this.cachedData = false;
  }
  secondsToDateFormat(secs:any){
    var month = new Date(secs).getMonth()+1;
    var day = new Date(secs).getDate();
    return new Date(secs).getFullYear()+'-'+
    (month<10?'0'+month:month)+
    '-'+(day<10?'0'+day:day);
  }
  getLast30DaysTotal(data:any){
    var total = 0;
    for(var i =0;i<data.length;i++){
      if(data[i].total){
        total+= data[i].total;
      }else if(data[i].totalBilled){
        total+= data[i].totalBilled;
      }
    }
    return total;
  }
  getPaidInvoices(data:any){
    var total = data.length;
    var paid = 0;
    for(var i =0;i<data.length;i++){
      if(data[i].paidDate){
        paid++;
      }
    }
    return paid+' of '+total;
  }
  getChartData(){
    this.lineChartData.labels = this.invoices.map( (x: { invoiceDate: any; }) => this.secondsToDateFormat(x.invoiceDate)).reverse();
    this.lineChartData.datasets[0].data = this.invoices.map( (x: { totalBilled: any; } ) => x.totalBilled).reverse();
  }
  setExpenseChartData(data:any){
    var chartData :any={};
    for(var i = 0;i<data.length;i++){
      console.log(data[i]);
      if(!chartData.hasOwnProperty(data[i].category)){
        chartData[data[i].category] = data[i].total;
      }else{
        chartData[data[i].category] += data[i].total;
      }
    }
    for(var z in chartData){
      this.pieChartData.datasets[0].data.push(chartData[z]);

      this.pieChartData.labels?.push(z);
      console.log(chartData[z]);
    }
    console.log('expensedata',chartData,this.pieChartData);
  }
  fetchDashboardData(){
    console.log('getting invoice data');
    var colRef = collection(this.db,'Invoices');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    var thirtyDaysAgoSecs = Date.now() - (86400*30*1000);
    var q = query(colRef,orderBy('invoiceDate','desc'),where('invoiceDate', '>=', thirtyDaysAgo));

    var invoicesColRef = collection(this.db,'Invoices');
    var invoicesQuery = query(invoicesColRef,orderBy('invoiceDate','desc'),where('invoiceDate', '>=', thirtyDaysAgoSecs));

    var expensesColRef = collection(this.db,'Expenses');
    var expenseQuery = query(expensesColRef,orderBy('date','desc'),where('date', '>=', thirtyDaysAgoSecs));

    var fuelColRef = collection(this.db,'Fuels');
    var fuelQuery = query(fuelColRef,orderBy('date','desc'),where('date', '>=', thirtyDaysAgoSecs));

    var taskColRef = collection(this.db,'Tasks');
    var taskQuery = query(taskColRef);

    var vehicleColRef = collection(this.db,'Vehicles');
    var vehicleQuery = query(vehicleColRef);
    
    onSnapshot(invoicesQuery,(snapshot: { docs: any[]; }) => {
      this.invoices = [];
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id});
        this.getChartData();
      });
      this.last30DayData.invoices = this.getLast30DaysTotal(this.invoices);
      this.last30DayData.invoicesPaid = this.getPaidInvoices(this.invoices);
      this.saveToLocalStorage('last30DayData',this.last30DayData);
    });


    console.log('getting exprenses data');
    onSnapshot(expenseQuery,(snapshot: { docs: any[]; }) => {
      this.expenses = [];
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      });
      this.saveToLocalStorage('expenses',this.expenses);
      this.last30DayData.expenses = this.getLast30DaysTotal(this.expenses);
      this.setExpenseChartData(this.expenses);
      this.saveToLocalStorage('last30DayData',this.last30DayData);
    });

    onSnapshot(fuelQuery,(snapshot: { docs: any[]; }) => {
      this.fuel = [];
      snapshot.docs.forEach( (doc) => {
        this.fuel.push({...doc.data(), id:doc.id})
      });
      this.saveToLocalStorage('fuel',this.fuel);
      this.last30DayData.fuel = this.getLast30DaysTotal(this.fuel);
      this.saveToLocalStorage('last30DayData',this.last30DayData);
    });
    onSnapshot(taskQuery,(snapshot: { docs: any[]; }) => {
      this.tasks = [];
      snapshot.docs.forEach( (doc) => {
        this.tasks.push({...doc.data(), id:doc.id})
      });
      this.last30DayData.tasks = this.tasks.length;
      this.saveToLocalStorage('last30DayData',this.last30DayData);
      this.saveToLocalStorage('tasks',this.tasks);
    });
    onSnapshot(vehicleQuery,(snapshot: { docs: any[]; }) => {
      this.vehicles = [];
      snapshot.docs.forEach( (doc) => {
        this.vehicles.push({...doc.data(), id:doc.id})
      });
      this.last30DayData.vehicles = this.vehicles.filter((x:any) => x.status == 'Operational').length+' of '+this.vehicles.length;
      this.saveToLocalStorage('last30DayData',this.last30DayData);
      this.saveToLocalStorage('vehicles',this.vehicles);
    });
    this.last30DayData.lastUpdated = new Date();
    this.saveToLocalStorage('last30DayData',this.last30DayData);
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
    var cachedVehiclesData = localStorage.getItem('vehicles');
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
    // if(cachedVehiclesData?.length){
    //   this.vehicles = JSON.parse(cachedVehiclesData);
    // }
  }

  saveToLocalStorage(id: string,data: any){
    localStorage.setItem(id,JSON.stringify(data));
  }

  getProfitData(){
    // this.profitThisYear = this.revenueThisYear - (this.gasExpenseThisYear+this.expensesThisYear);
    // this.profitThisMonth = this.revenueThisMonth - (this.gasExpenseThisMonth+this.expensesThisMonth);
    // this.profitLastMonth = this.revenueLastMonth - (this.gasExpenseLastMonth+this.expensesLastMonth);
    // this.profitLastYear = this.revenueLastYear - (this.gasExpenseLastYear+this.expensesLastYear);
  }

  reloadChart(chart:any){
    chart.datasets[0].data.push(1);
    setTimeout(() => {
      chart.datasets[0].data.pop();
    },1100);
  }

  currentFeatureChanged(x:any){
    this.currentFeature = x;
  }
}
