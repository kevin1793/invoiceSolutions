import { Component, OnInit } from '@angular/core';

import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface item {
  vehicle_number: number,
  nickname:string,
  vin:string,
  mileage:number,
  notes:string,
  status:string
  // ...
};

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements OnInit {

  constructor(firestore: Firestore,private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) { }

  dashboard = true;
  dashboardData = 'Y';
  showAddItemBox = false;
  showModal = false;

  vehicleItem: UntypedFormGroup = this.fb.group({
    vehicle_number: ['',Validators.required],
    nickname: [''],
    vin: [''],
    mileage:[''],
    notes:[''],
    status:['',Validators.required],
  });

  vehicles:any;
  tempvehicleEdit = null;
  vehiclesSub:any;
  db = getFirestore();
  colRef = collection(this.db,'Vehicles');
  q = query(this.colRef,orderBy('vehicle_number','desc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.vehicles = []
      snapshot.docs.forEach( (doc) => {
        this.vehicles.push({...doc.data(), id:doc.id})
      })
    })
    return;
  }

  //NEW FUNCTIONs DOWN BELOW

  async deletevehicle(item:any){
    const invoiceCollection = this.afs.collection<item>('Vehicles');
    var del = confirm('Are you sure you want to delete vehicle '+item.vehicle_number+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  onSubmit(){
    //
  }

  addvehicle(){
    const invoiceCollection = this.afs.collection<item>('Vehicles');
    var vehicleItem = this.vehicleItem.value;
    var t = invoiceCollection.add(vehicleItem);
    this.vehicleItem.reset();
    if(this.tempvehicleEdit){
      this.quickDeletevehicle(this.tempvehicleEdit);
    }
  }

  async quickDeletevehicle(item:any){
    const invoiceCollection = this.afs.collection<item>('Vehicles');
    invoiceCollection.doc(item.id).delete();
    this.showAddItemBox = !this.showAddItemBox;
  }

  editvehicle(e:any){
    var thisAll =this;
    this.vehicleItem.get('vehicle_number')?.setValue(e.vehicle_number);
    this.vehicleItem.get('notes')?.setValue(e.notes);
    this.vehicleItem.get('vin')?.setValue(e.vin);
    this.vehicleItem.get('nickname')?.setValue(e.nickname);
    this.vehicleItem.get('mileage')?.setValue(e.mileage);
    this.vehicleItem.get('status')?.setValue(e.status);
    this.tempvehicleEdit = e;
    thisAll.showAddItemBox = true;
  }

  resetForm(){
    this.vehicleItem.reset();
  }

}
