import { Component, OnInit  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';

interface Record {
  item: string,
  description:string,
  date: string,
  modified :string,
  category: string,
  quantity:number
  // ...
};

interface Category {
  category: string,
  // ...
};

interface Unit {
  unit: string,
  // ...
};

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  dashboard = true;
  dashboardData = 'Y';
  showAddInvoiceBox = false;
  cachedData = true;
  collectionName = 'Inventory';

  recordEdit = null;
  categoryEdit = null;
  showAddRecordBox = false;
  showAddCategoryBox = false;
  showAddUnitBox = false;
  filterProperty = 'item';

  records:any;
  allRecords:any;
  categories:any;
  units:any;

  db = getFirestore();
  colRef = collection(this.db,this.collectionName);
  q = query(this.colRef,orderBy('modified','desc'),limit(25));

  colCategoryRef = collection(this.db,this.collectionName+'Category');
  qCategory = query(this.colCategoryRef,orderBy('category','asc'));

  colUnitRef = collection(this.db,this.collectionName+'Unit');
  qUnit = query(this.colUnitRef,orderBy('unit','asc'));

  constructor(firestore: Firestore,private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) { }

  // FORM ITEMS
  recordItem: UntypedFormGroup = this.fb.group({
    item: ['',Validators.required],
    description:[null,Validators.required],
    category:[null,Validators.required],
    unit:[null,Validators.required],
    modified :[''],
    quantity:[null,Validators.required],
  });

  categoryItem: UntypedFormGroup = this.fb.group({
    category: ['',Validators.required],
  });

  unitItem: UntypedFormGroup = this.fb.group({
    unit: ['',Validators.required],
  });

  currentSortDirection = true;
  currentPropDirection = '';

  ngOnInit(): void {
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      this.allRecords = this.records;
      console.log('RECORDS',this.records);
    });

    onSnapshot(this.qCategory,(snapshot: { docs: any[]; }) => {
      this.categories = []
      snapshot.docs.forEach( (doc) => {
        this.categories.push({...doc.data(), id:doc.id})
      })
      console.log('CATEGORIES',this.categories);
    });

    onSnapshot(this.qUnit,(snapshot: { docs: any[]; }) => {
      this.units = []
      snapshot.docs.forEach( (doc) => {
        this.units.push({...doc.data(), id:doc.id})
      })
      console.log('UNITS',this.units);
    });
  }

  // FUNCTIONS
  sortProperty(prop:string){
    console.log('sortProperty',prop)
    var thisAll = this;
    this.records.sort(function (a:any, b:any) {
      if(thisAll.currentSortDirection == true){
        return a[prop] - b[prop];
      }else{
        return b[prop] - a[prop];
      }
    });
    this.currentSortDirection = !this.currentSortDirection;
  }
  filterPropertyChanged(e:any){
    console.log('filterPropertyChanged',e);
    this.filterProperty = e.srcElement.value;
  }
  removeUnit(u:any){
    const collection = this.afs.collection<Record>(this.collectionName+'Unit');
    var del = confirm('Are you sure you want to delete '+u.unit+'?');

    if(del){
      collection.doc(u.id).delete();
    }
  }
  removeCategory(u:any){
    const collection = this.afs.collection<Record>(this.collectionName+'Category');
    var del = confirm('Are you sure you want to delete '+u.name+'?');

    if(del){
      collection.doc(u.id).delete();
    }
  }
  filterChange(e:any){
    console.log('filterCHange',e);
    if(e.srcElement.value.length){
      this.records = this.allRecords.filter((item:any) => 
        item[this.filterProperty].toLowerCase().includes((e.srcElement.value).toLowerCase())
        )
      .map((item:any) => (item));
    }else{
      this.records = this.allRecords;
    }
  }
  addRecordClicked(){
    this.recordItem.reset();
  }

  addUnitClicked(){
    this.unitItem.reset();
  }

  addCategoryClicked(){
    this.categoryItem.reset();
  }

  addCategory(){
    const invoiceCollection = this.afs.collection<Category>(this.collectionName+'Category');
    var categoryItem = this.categoryItem.value;
    var t = invoiceCollection.add(categoryItem);
    this.categoryItem.reset();
  }

  addUnit(){
    const invoiceCollection = this.afs.collection<Unit>(this.collectionName+'Unit');
    var unitItem = this.unitItem.value;
    var t = invoiceCollection.add(unitItem);
    this.unitItem.reset();
  }

  addRecord(){
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var recordItem = this.recordItem.value;
    var d = new Date();
    recordItem.modified = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var t = invoiceCollection.add(recordItem);
    this.recordItem.reset();
    if(this.recordEdit){
      this.quickDeleteRecord(this.recordEdit);
    }
  }

  async quickDeleteRecord(fuel:any){
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    invoiceCollection.doc(fuel.id).delete();
    this.showAddRecordBox = !this.showAddRecordBox;
  }

  async deleteRecord(item:any){
    const collection = this.afs.collection<Record>(this.collectionName);
    var del = confirm('Are you sure you want to delete '+item.item+'?');

    if(del){
      collection.doc(item.id).delete();
    }
  }

  editRecord(e:any){
    // var thisAll =this;
    // this.fuelItem.get('truck_number')?.setValue(e.truck_number);
    // this.fuelItem.get('date')?.setValue(e.date);
    // this.fuelItem.get('mileage')?.setValue(e.mileage);
    // this.fuelItem.get('gallons')?.setValue(e.gallons);
    // this.fuelItem.get('total')?.setValue(e.total);
    // this.fuelEdit = e;
    // console.log(this.fuelItem.get('truck_number'),e);
    // thisAll.showAddFuelBox = true;
  }

  refreshClicked(){
    
  }

  onSubmit(){
    //
  }

}
