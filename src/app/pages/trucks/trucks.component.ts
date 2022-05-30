import { Component, OnInit } from '@angular/core';

import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface item {
  truck_number: number,
  nickname:string,
  vin:string,
  mileage:number,
  notes:string,
  status:string
  // ...
};

@Component({
  selector: 'app-trucks',
  templateUrl: './trucks.component.html',
  styleUrls: ['./trucks.component.css']
})
export class TrucksComponent implements OnInit {

  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore,private router:Router) { }

  dashboard = true;
  dashboardData = 'Y';
  showAddItemBox = false;
  showModal = false;

  truckItem: FormGroup = this.fb.group({
    truck_number: ['',Validators.required],
    nickname: [''],
    vin: [''],
    mileage:[''],
    notes:[''],
    status:['',Validators.required],
  });

  trucks:any;
  tempTruckEdit = null;
  trucksSub:any;
  db = getFirestore();
  colRef = collection(this.db,'Trucks');
  q = query(this.colRef,orderBy('truck_number','desc'));

  ngOnInit(): void {
    //load in previous trucks
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.trucks = []
      snapshot.docs.forEach( (doc) => {
        this.trucks.push({...doc.data(), id:doc.id})
      })
      console.log(this.trucks);
    })
    return;
  }

  //NEW FUNCTIONs DOWN BELOW

  async deleteTruck(item:any){
    const invoiceCollection = this.afs.collection<item>('Trucks');
    console.log(item);
    var del = confirm('Are you sure you want to delete Truck '+item.truck_number+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  onSubmit(){
    //
  }

  addTruck(){
    console.log(this.truckItem,this.truckItem.value);
    const invoiceCollection = this.afs.collection<item>('Trucks');
    var truckItem = this.truckItem.value;
    var t = invoiceCollection.add(truckItem);
    this.truckItem.reset();
    if(this.tempTruckEdit){
      this.quickDeleteTruck(this.tempTruckEdit);
    }
  }

  async quickDeleteTruck(item:any){
    const invoiceCollection = this.afs.collection<item>('Trucks');
    console.log(item);
    invoiceCollection.doc(item.id).delete();
    this.showAddItemBox = !this.showAddItemBox;
  }

  editTruck(e:any){
    var thisAll =this;
    console.log('edit invoice',e);
    this.truckItem.get('truck_number')?.setValue(e.truck_number);
    this.truckItem.get('notes')?.setValue(e.notes);
    this.truckItem.get('vin')?.setValue(e.vin);
    this.truckItem.get('nickname')?.setValue(e.nickname);
    this.truckItem.get('mileage')?.setValue(e.mileage);
    this.truckItem.get('status')?.setValue(e.status);
    this.tempTruckEdit = e;
    thisAll.showAddItemBox = true;
  }

  resetForm(){
    this.truckItem.reset();
  }

}
