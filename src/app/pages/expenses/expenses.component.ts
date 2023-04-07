import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy, limit ,query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';

interface Item {
  item: string,
  category:string,
  date:string,
  total:number,
  quantity:number
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
    date: ['',Validators.required],
    quantity:[null,Validators.required],
    total:[null,Validators.required],
  });

  categoryItem: UntypedFormGroup = this.fb.group({
    name: ['',Validators.required],
  });
  
  expenses:any;
  categories:any;
  expensesSub:any;

  db = getFirestore();
  colRef = collection(this.db,'Expenses');
  q = query(this.colRef,orderBy('date','desc'));

  colCategoryRef = collection(this.db,this.collectionName+'Category');
  qCategory = query(this.colCategoryRef,orderBy('name','asc'));

  ngOnInit(): void {
    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.expenses = []
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      })
    });
    onSnapshot(this.qCategory,(snapshot: { docs: any[]; }) => {
      this.categories = []
      snapshot.docs.forEach( (doc) => {
        this.categories.push({...doc.data(), id:doc.id})
      })
      console.log(this.categories)
    });
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
    //
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
    var t = invoiceCollection.add(expenseItem);
    this.expenseItem.reset();
    if(this.expenseEdit){
      this.quickDeleteFuel(this.expenseEdit);
    }
  }

  addItemClicked(){
    this.expenseItem.reset();
  }

  // item: ['',Validators.required],
  //   category: ['',Validators.required],
  //   date: ['',Validators.required],
  //   quantity:[null,Validators.required],
  //   total:[null,Validators.required],
  editExpense(e:any){
    var thisAll =this;
    this.expenseItem.get('item')?.setValue(e.item);
    this.expenseItem.get('date')?.setValue(e.date);
    this.expenseItem.get('category')?.setValue(e.category);
    this.expenseItem.get('quantity')?.setValue(e.quantity);
    this.expenseItem.get('total')?.setValue(e.total);
    this.expenseEdit = e;
    thisAll.showAddExpenseBox = true;
  }

}
