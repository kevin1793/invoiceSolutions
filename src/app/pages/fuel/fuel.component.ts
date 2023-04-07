import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
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
    vehicle_number: ['',Validators.required],
    date: ['',Validators.required],
    mileage:[null,Validators.required],
    gallons:[null,Validators.required],
    total:[null,Validators.required],
  });
  
  fuels:any;
  vehicles:any;
  fuelEdit = null;

  db = getFirestore();
  colRef = collection(this.db,'Fuels');
  q = query(this.colRef,orderBy('date','desc'));

  colRefVehicles = collection(this.db,'Vehicles');
  qVehicles = query(this.colRefVehicles,orderBy('vehicle_number','desc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    //load in previous fuels
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.fuels = []
      snapshot.docs.forEach( (doc) => {
        this.fuels.push({...doc.data(), id:doc.id})
      })
    });
    onSnapshot(this.qVehicles,(snapshot: { docs: any[]; }) => {
      this.vehicles = []
      snapshot.docs.forEach( (doc) => {
        this.vehicles.push({...doc.data(), id:doc.id})
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
    this.fuelItem.get('vehicle_number')?.setValue(e.vehicle_number);
    this.fuelItem.get('date')?.setValue(e.date);
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
