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
  db = getFirestore()
  colRef = collection(this.db,'Invoices')
  q = query(this.colRef,orderBy('invoiceDate','desc'));
  revenueLastYear = 0;
  revenueLastMonth = 0;
  revenueThisMonth = 0;
  invoicesPaidThisMonth = 0;
  invoicesThisMonth = 0;

  ngOnInit(): void {
    console.log('DASHBOARD PAGE',this.invoices);
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.invoices = []
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id})
      })
      console.log('DASHBOARD PAGE',this.invoices);
      this.getRevenueLastYear();
      this.getInvoicesPaidThisMonth();
      this.getRevenueLastMonth();
      this.getRevenueThisMonth();
    });

  }

  getInvoicesPaidThisMonth(){
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
