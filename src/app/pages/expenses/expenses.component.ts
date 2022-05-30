import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
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
  q = query(this.colRef,orderBy('date','desc'));

  ngOnInit(): void {
    //load in previous expenses
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.expenses = []
      snapshot.docs.forEach( (doc) => {
        this.expenses.push({...doc.data(), id:doc.id})
      })
      console.log(this.expenses);
    })
    return;
  }

  //NEW FUNCTIONs DOWN BELOW

  async deleteExpense(item:any){
    const invoiceCollection = this.afs.collection<Item>('Expenses');
    console.log(item);
    var del = confirm('Are you sure you want to delete expense '+item.item+' from '+item.date+'?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  onSubmit(){
    //
  }

  addExpense(){
    console.log(this.expenseItem,this.expenseItem.value);
    const invoiceCollection = this.afs.collection<Item>('Expenses');
    var expenseItem = this.expenseItem.value;
    var t = invoiceCollection.add(expenseItem);
    this.expenseItem.reset();
  }

  editExpense(e:any){

  }

}
