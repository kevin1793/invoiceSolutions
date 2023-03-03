import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface Item {
  truck_number: number,
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
  // truckNumber = '';


  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore,private router:Router) { }

  fuelItem: FormGroup = this.fb.group({
    truck_number: ['',Validators.required],
    date: ['',Validators.required],
    mileage:[null,Validators.required],
    gallons:[null,Validators.required],
    total:[null,Validators.required],
  });
  
  fuels:any;
  trucks:any;
  fuelEdit = null;

  db = getFirestore();
  colRef = collection(this.db,'Fuels');
  q = query(this.colRef,orderBy('date','desc'),limit(25));

  colRefTrucks = collection(this.db,'Trucks');
  qTrucks = query(this.colRefTrucks,orderBy('truck_number','desc'));

  ngOnInit(): void {
    //load in previous fuels
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.fuels = []
      snapshot.docs.forEach( (doc) => {
        this.fuels.push({...doc.data(), id:doc.id})
      })
    });
    onSnapshot(this.qTrucks,(snapshot: { docs: any[]; }) => {
      this.trucks = []
      snapshot.docs.forEach( (doc) => {
        this.trucks.push({...doc.data(), id:doc.id})
      })
    })
    return;
  }

  //NEW FUNCTIONs DOWN BELOW

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

  calculateTotal(){
    (this.fuelItem.value);
    if(this.fuelItem.get('gallons')?.value && this.fuelItem.get('cost_per_gallon')?.value ){
      var total = (parseFloat(this.fuelItem.get('gallons')?.value)*parseFloat(this.fuelItem.get('cost_per_gallon')?.value)).toFixed(2);
      this.fuelItem.get('total')?.setValue(total); 
    }
  }

  addFuel(){
    (this.fuelItem,this.fuelItem.value);
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    var fuelItem = this.fuelItem.value;
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
    this.fuelItem.reset();
  }
  
  editFuel(e:any){
    var thisAll =this;
    this.fuelItem.get('truck_number')?.setValue(e.truck_number);
    this.fuelItem.get('date')?.setValue(e.date);
    this.fuelItem.get('mileage')?.setValue(e.mileage);
    this.fuelItem.get('gallons')?.setValue(e.gallons);
    this.fuelItem.get('total')?.setValue(e.total);
    this.fuelEdit = e;
    console.log(this.fuelItem.get('truck_number'),e);
    thisAll.showAddFuelBox = true;
  }

  resetForm(){
    this.fuelItem.reset();
  }

}
