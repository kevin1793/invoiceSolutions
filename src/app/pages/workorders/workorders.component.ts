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
  quantity:number,
  id:string
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
  selector: 'app-workorders',
  templateUrl: './workorders.component.html',
  styleUrls: ['./workorders.component.css']
})
export class WorkordersComponent {

  dashboard = true;
  dashboardData = 'Y';
  showAddInvoiceBox = false;
  cachedData = true;
  collectionName = 'WorkOrder';

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
  q = query(this.colRef,orderBy('modified','desc'));

  colCategoryRef = collection(this.db,this.collectionName+'Category');
  qCategory = query(this.colCategoryRef,orderBy('category','asc'));

  colUnitRef = collection(this.db,this.collectionName+'Unit');
  qUnit = query(this.colUnitRef,orderBy('unit','asc'));

  constructor(firestore: Firestore,private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) { }

  recordItem: UntypedFormGroup = this.fb.group({
    item: ['',Validators.required],
    description:[null],
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

  editItem: UntypedFormGroup = this.fb.group({
    quantity: [0,Validators.required],
  });

  editQuantity: number = 0;

  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  ngOnInit(): void {

  }

  filterPropertyChanged(e:any){
    // console.log('filterPropertyChanged',e);
    // this.filterProperty = e.srcElement.value;
  }

  sortPropertyChanged(prop:string){
    // console.log('sortProperty',prop);
    // this.currentSortDirection = !this.currentSortDirection;
    // this.sortProperty = prop;
    // this.records = this.records.sort((a:any, b:any) => this.compare(a, b, this.sortProperty));
    // console.log(this.records);
  }

  addRecord(){
    // const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    // var recordItem = this.recordItem.value;
    // var d = new Date();
    // recordItem.modified = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    // var t = invoiceCollection.add(recordItem);
    // this.recordItem.reset();
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

  editRecordClicked(rec:any){
    this.recordEdit = rec;
    this.editItem.get('quantity')?.setValue((rec.quantity));
  }
  updateRecord(rec:Record,e:any){
    console.log('updateRecord',e,rec);
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var updatedRec  = rec;
    updatedRec.quantity = this.editItem.get('quantity')?.value;
    invoiceCollection.doc(updatedRec.id).update(updatedRec);
  }

  refreshClicked(){
    
  }

  onSubmit(){
    //
  }

}
