import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy,limit, query,onSnapshot,where, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface Item {
  vehicle_number: number,
  mileage:number,
  date:string,
  gallons:string,
  total:number,
  cost_per_gallon:number
  // ...
};

@Component({
  selector: 'app-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.css']
})
export class FuelComponent implements OnInit {
  dashboard = true;
  dashboardData = 'Y';
  showAddFuelBox = false;
  showModal = false;
  showAddItemBox  = false;
  // vehicleNumber = '';


  constructor(firestore: Firestore,private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) { }

  fuelItem: UntypedFormGroup = this.fb.group({
    vehicle_number: [''],
    date: ['',Validators.required],
    mileage:[null,Validators.required],
    gallons:[null,Validators.required],
    total:[null,Validators.required],
  });
  
  collectionName = 'Fuels';
  records:any;
  allRecords:any;
  vehicles:any;
  total:any = 0;
  fuelEdit = null;
  addingFuel = false;

  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  db = getFirestore();
  colRef = collection(this.db,'Fuels');
  q = query(this.colRef,orderBy('date','desc'),limit(10));

  colRefVehicles = collection(this.db,'Vehicles');
  qVehicles = query(this.colRefVehicles,orderBy('vehicle_number','desc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    this.viewFromChanged('');
    onSnapshot(this.qVehicles,(snapshot: { docs: any[]; }) => {
      this.vehicles = []
      snapshot.docs.forEach( (doc) => {
        this.vehicles.push({...doc.data(), id:doc.id});
        
      })
    })
    return;
  }
  calculateTotal(){
    this.total = 0;
    for(var i =0;i<this.records.length;i++){
      this.total +=typeof this.records[i].total == 'string'?parseFloat(this.records[i].total):this.records[i].total;
    }
  }
  viewFromChanged(e:any){
    console.log('viewFromChanged',e);
    var queryDate = 0;
    if(e.target?.value == 'This Year'){
      var d = new Date()
      var thisYear = new Date(d.getFullYear()+'-1-1');
      queryDate = Date.parse(thisYear.toString());
    }else if(e.target?.value == 'Last Year'){
      var d = new Date()
      var thisYear = new Date((d.getFullYear()-1)+'-1-1');
      queryDate = Date.parse(thisYear.toString());
    }else{
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      queryDate = Date.now() - (86400*30*1000);
    }

    var invoicesColRef = collection(this.db,'Fuels');
    var invoicesQuery = query(invoicesColRef,orderBy('date','desc'),where('date', '>=', queryDate));
    if(e.target?.value == 'Last Year'){
      var d = new Date()
      var thisYear = new Date(d.getFullYear()+'-1-1');
      var endDate = Date.parse(thisYear.toString());
      invoicesQuery = query(invoicesColRef,orderBy('date','desc'),where('date', '>=', queryDate),where('date', '<', endDate));
    }
    
    onSnapshot(invoicesQuery,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      console.log('Fuel',this.records);
      this.allRecords = this.records;
      this.calculateTotal();
      if(this.records && typeof this.records[0].date == 'string'){
        this.convertStringDateToInt(this.records);
      }
    });
  }
  convertStringDateToInt(data:any){
    const invoiceCollection = this.afs.collection<Item>(this.collectionName);
    for(var i =0;i<data.length;i++){
      if(typeof data[i].date == 'string'){
        var newDate = Date.parse(data[i].date);
        console.log('new date',data[i],newDate,new Date(newDate));
        var updatedRec = data[i];
        updatedRec.date = newDate;
        invoiceCollection.doc(updatedRec.id).update(updatedRec);
      }
    }
  }

  //NEW FUNCTIONs DOWN BELOW
  compare(a: any, b: any, propName: string) {
    let result = 0;
    if (a[propName] < b[propName]) {
      result = -1;
    } else if (a[propName] > b[propName]) {
      result = 1;
    }
    if (this.currentSortDirection) {
      result = -result;
    }
    return result;
  }
  sortPropertyChanged(prop:string){
    console.log('sortProperty',prop);
    this.currentSortDirection = !this.currentSortDirection;
    this.sortProperty = prop;
    this.records = this.records.sort((a:any, b:any) => this.compare(a, b, this.sortProperty));
    console.log(this.records);
  }

  async deleteFuel(item:any){
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    var del = confirm('Are you sure you want to delete fuel '+item.item+' from '+item.date+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  onSubmit(){
    //
  }
  addFuel(){
    (this.fuelItem,this.fuelItem.value);
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    var fuelItem = this.fuelItem.value;
    console.log('fuel Item date',fuelItem.date);
    if(typeof fuelItem.date == 'string'){
      var days = new Date(fuelItem.date);
      days.setDate(days.getDate()+1);
      fuelItem.date = Date.parse(days.toISOString());
    }
    console.log('fuel Item',fuelItem);
    var t = invoiceCollection.add(fuelItem);
    this.fuelItem.reset();
    if(this.fuelEdit){
      this.quickDeleteFuel(this.fuelEdit);
    }
  }

  async quickDeleteFuel(fuel:any){
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    invoiceCollection.doc(fuel.id).delete();
    this.showAddItemBox = !this.showAddItemBox;
  }

  addFuelClicked(){
    this.addingFuel =true;
    this.fuelItem.reset();
  }
  secondsToDateFormat(secs:any){
    var month = new Date(secs).getMonth()+1;
    var day = new Date(secs).getDate();
    return new Date(secs).getFullYear()+'-'+
    (month<10?'0'+month:month)+
    '-'+(day<10?'0'+day:day);
  }
  
  editFuel(e:any){
    this.addingFuel = false;
    var thisAll =this;
    this.fuelItem.get('vehicle_number')?.setValue(e.vehicle_number);
    var formatDate = typeof e.date == 'string'?e.date:this.secondsToDateFormat(e.date);
      
    this.fuelItem.get('date')?.setValue(formatDate);
    this.fuelItem.get('mileage')?.setValue(e.mileage);
    this.fuelItem.get('gallons')?.setValue(e.gallons);
    this.fuelItem.get('total')?.setValue(e.total);
    this.fuelEdit = e;
    console.log(this.fuelItem.get('vehicle_number'),e);
    thisAll.showAddFuelBox = true;
  }

  resetForm(){
    this.fuelItem.reset();
  }

}
