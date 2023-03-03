import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  dashboard = true;
  dashboardData = 'Y';
  showAddExpenseBox = false;
  showModal = false;
  expenseEdit = '';

  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore,private router:Router) { }

  expenseItem: FormGroup = this.fb.group({
    item: ['',Validators.required],
    category: ['',Validators.required],
    date: ['',Validators.required],
    quantity:[null,Validators.required],
    total:[null,Validators.required],
  });
  
  expenses:any;
  expensesSub:any;
  db = getFirestore();
  colRef = collection(this.db,'Expenses');
  q = query(this.colRef,orderBy('date','desc'),limit(25));
  // q2 = query(this.colRef,orderBy('date','desc'));

  ngOnInit(): void {
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.expenses = []
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      })
    })
    return;
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
