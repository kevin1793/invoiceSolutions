import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy, limit ,query,onSnapshot,where, getFirestore } from 'firebase/firestore';
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
  total:any = 0;

  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  db = getFirestore();
  colRef = collection(this.db,'Expenses');
  q = query(this.colRef,orderBy('date','desc'),limit(10));

  colCategoryRef = collection(this.db,this.collectionName+'Category');
  qCategory = query(this.colCategoryRef,orderBy('name','asc'));

  colUnitRef = collection(this.db,this.collectionName+'Unit');
  qUnit = query(this.colUnitRef,orderBy('unit','asc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    this.viewFromChanged('');
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
  calculateTotal(recs:any){
    var recs = recs;
    this.total = 0;
    for(var i =0;i<recs.length;i++){
      this.total +=recs[i].total;
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

    var invoicesColRef = collection(this.db,'Expenses');
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
      console.log('EXPENSES',this.records);
      this.allRecords = this.records;
      this.calculateTotal(this.records);
      if(this.records && typeof this.records[0].date == 'string'){
        this.convertStringDateToInt(this.records);
      }
    });
  }
  filterTasks(e:any){
    console.log('filterCHange',e);
    var val = e.target.value;
    if(val == 'Paid'){
      this.records = this.allRecords.filter((item:any) => 
      item.paidDate
        )
      .map((item:any) => (item));
    }else if(val == 'Not Paid'){
      this.records = this.allRecords.filter((item:any) => 
        !item.paidDate
        )
      .map((item:any) => (item));
    }else{
      this.records = this.allRecords;
    }
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
    this.calculateTotal(this.records);
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
    var date = this.getDatePickerSeconds(expenseItem.date);
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
  getDatePickerSeconds(datePickerValue:any){
    var d = new Date(datePickerValue);
    d.setDate(d.getDate()+1);
    return Date.parse(d.toString());
  }
  addUnit(){
    const invoiceCollection = this.afs.collection<Unit>(this.collectionName+'Unit');
    var unitItem = this.unitItem.value;
    unitItem.date = this.getDatePickerSeconds(unitItem.date);
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
