import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy, limit ,query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface Item {
  item: string,
  category:string,
  date:number,
  unit:string,
  total:number,
  quantity:number
  // ...
};
interface Unit {
  unit: string,
  // ...
};
interface Category {
  name: string,
  // ...
};

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  dashboard = true;
  dashboardData = 'Y';
  showAddExpenseBox = false;
  showAddCategoryBox = false;
  showAddUnitBox = false;
  showModal = false;
  expenseEdit = '';
  collectionName = 'Expenses';

  constructor(firestore: Firestore,
    private fb:UntypedFormBuilder,
    public afs:AngularFirestore,
    private router:Router
    ) { }

  expenseItem: UntypedFormGroup = this.fb.group({
    item: ['',Validators.required],
    category: ['',Validators.required],
    unit: [''],
    id: [''],
    date: [null,Validators.required],
    quantity:[null,Validators.required],
    total:[null,Validators.required],
  });
  unitItem: UntypedFormGroup = this.fb.group({
    unit: ['',Validators.required],
  });
  categoryItem: UntypedFormGroup = this.fb.group({
    name: ['',Validators.required],
  });

  filterProperty = 'item';
  
  records:any;
  allRecords:any;
  categories:any;
  expensesSub:any;
  units:any;
  editRecord:any;

  db = getFirestore();
  colRef = collection(this.db,'Expenses');
  q = query(this.colRef,orderBy('date','desc'));

  colCategoryRef = collection(this.db,this.collectionName+'Category');
  qCategory = query(this.colCategoryRef,orderBy('name','asc'));

  colUnitRef = collection(this.db,this.collectionName+'Unit');
  qUnit = query(this.colUnitRef,orderBy('unit','asc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      console.log('EXPENSES',this.records);
      this.allRecords = this.records;
    });
    onSnapshot(this.qCategory,(snapshot: { docs: any[]; }) => {
      this.categories = []
      snapshot.docs.forEach( (doc) => {
        this.categories.push({...doc.data(), id:doc.id})
      })
      console.log(this.categories)
    });
    onSnapshot(this.qUnit,(snapshot: { docs: any[]; }) => {
      this.units = []
      snapshot.docs.forEach( (doc) => {
        this.units.push({...doc.data(), id:doc.id})
      })
      console.log('UNITS',this.units);
    });
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
  filterPropertyChanged(e:any){
    console.log('filterPropertyChanged',e);
    this.filterProperty = e.srcElement.value;
  }
  addCategoryClicked(){
    this.categoryItem.reset();
  }
  addCategory(){
    const invoiceCollection = this.afs.collection<Category>(this.collectionName+'Category');
    var categoryItem = this.categoryItem.value;
    var t = invoiceCollection.add(categoryItem);
    this.categoryItem.reset();
    if(this.categories.length <= 1){
      onSnapshot(this.qCategory,(snapshot: { docs: any[]; }) => {
        this.categories = []
        snapshot.docs.forEach( (doc) => {
          this.categories.push({...doc.data(), id:doc.id})
        })
      });
    }
  }
  removeCategory(u:any){
    console.log('remove category',u);
    const collection = this.afs.collection<Category>(this.collectionName+'Category');
    var del = confirm('Are you sure you want to delete '+u.name+'?');

    if(del){
      collection.doc(u.id).delete();
    }
  }
  async deleteExpense(item:any){
    const invoiceCollection = this.afs.collection<Item>('Expenses');
    var del = confirm('Are you sure you want to delete expense '+item.item+' from '+item.date+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }
  onSubmit(){
  }
  async quickDeleteFuel(fuel:any){
    const invoiceCollection = this.afs.collection<Item>('Expenses');
    invoiceCollection.doc(fuel.id).delete();
    this.showAddExpenseBox = !this.showAddExpenseBox;
  }
  addFuelClicked(){
    this.expenseItem.reset();
  }
  addExpense(){
    const invoiceCollection = this.afs.collection<Item>('Expenses');
    var expenseItem = this.expenseItem.value;
    var date = Date.parse(expenseItem.date);
    expenseItem.date = date;
    var t = invoiceCollection.add(expenseItem);
    console.log(expenseItem);
    this.expenseItem.reset();
    if(this.expenseEdit){
      this.quickDeleteFuel(this.expenseEdit);
    }
  }
  addItemClicked(){
    this.expenseItem.reset();
  }
  addUnit(){
    const invoiceCollection = this.afs.collection<Unit>(this.collectionName+'Unit');
    var unitItem = this.unitItem.value;
    var t = invoiceCollection.add(unitItem);
    this.unitItem.reset();
  }
  addUnitClicked(){
    this.unitItem.reset();
  }
  removeUnit(u:any){
    const collection = this.afs.collection<Unit>(this.collectionName+'Unit');
    var del = confirm('Are you sure you want to delete '+u.unit+'?');
    if(del){
      collection.doc(u.id).delete();
    }
  }
  updateRecord(){
    const invoiceCollection = this.afs.collection<Item>(this.collectionName);
    var updatedRec  = this.expenseItem.value;
    console.log('bfore',updatedRec);
    if(typeof updatedRec.date == 'string'){
      var days = new Date(updatedRec.date);
      days.setDate(days.getDate()+1);
      updatedRec.date = Date.parse(days.toISOString());
    }
    console.log(updatedRec);
    invoiceCollection.doc(updatedRec.id).update(updatedRec);
    this.editRecord = false;
    this.showAddExpenseBox = !this.showAddExpenseBox;
  }
  secondsToDateFormat(secs:any){
    var month = new Date(secs).getMonth()+1;
    var day = new Date(secs).getDate();
    return new Date(secs).getFullYear()+'-'+
    (month<10?'0'+month:month)+
    '-'+(day<10?'0'+day:day);
  }
  editExpense(e:any){
    console.log('edit expense',e,this.expenseItem);
    var thisAll =this;
    this.editRecord = true;
    this.expenseItem.get('item')?.setValue(e.item);
    var formatDate = this.secondsToDateFormat(e.date);
    console.log('formatDate',formatDate);
    this.expenseItem.get('date')?.setValue(formatDate);
    this.expenseItem.get('category')?.setValue(e.category);
    this.expenseItem.get('unit')?.setValue(e.unit||'');
    this.expenseItem.get('quantity')?.setValue(e.quantity);
    this.expenseItem.get('total')?.setValue(e.total);
    this.expenseItem.get('id')?.setValue(e.id);
    // this.expenseEdit = e;
    thisAll.showAddExpenseBox = true;
  }
}
