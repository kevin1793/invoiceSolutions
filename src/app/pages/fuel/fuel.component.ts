import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
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

  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore,private router:Router) { }

  fuelItem: FormGroup = this.fb.group({
    truck_number: ['',Validators.required],
    date: ['',Validators.required],
    mileage:[null,Validators.required],
    gallons:[null,Validators.required],
    cost_per_gallon:[null,Validators.required],
    total:[null,Validators.required],
  });
  
  fuels:any;
  trucks:any;

  db = getFirestore();
  colRef = collection(this.db,'Fuels');
  q = query(this.colRef,orderBy('date','desc'));

  colRefTrucks = collection(this.db,'Trucks');
  qTrucks = query(this.colRefTrucks,orderBy('truck_number','desc'));

  ngOnInit(): void {
    //load in previous fuels
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.fuels = []
      snapshot.docs.forEach( (doc) => {
        this.fuels.push({...doc.data(), id:doc.id})
      })
      console.log('fuel list',this.fuels);
    });
    onSnapshot(this.qTrucks,(snapshot: { docs: any[]; }) => {
      this.trucks = []
      snapshot.docs.forEach( (doc) => {
        this.trucks.push({...doc.data(), id:doc.id})
      })
      console.log('trucks list',this.trucks);
    })
    return;
  }

  //NEW FUNCTIONs DOWN BELOW

  async deleteFuel(item:any){
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    console.log(item);
    var del = confirm('Are you sure you want to delete fuel '+item.item+' from '+item.date+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  onSubmit(){
    //
  }

  calculateTotal(){
    console.log(this.fuelItem.value);
    if(this.fuelItem.get('gallons')?.value && this.fuelItem.get('cost_per_gallon')?.value ){
      var total = (parseFloat(this.fuelItem.get('gallons')?.value)*parseFloat(this.fuelItem.get('cost_per_gallon')?.value)).toFixed(2);
      this.fuelItem.get('total')?.setValue(total); 
    }
  }

  addFuel(){
    console.log(this.fuelItem,this.fuelItem.value);
    const invoiceCollection = this.afs.collection<Item>('Fuels');
    var fuelItem = this.fuelItem.value;
    var t = invoiceCollection.add(fuelItem);
    this.fuelItem.reset();
  }

  editFuel(e:any){

  }

}
