import { Component, OnInit,Injectable } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { Firestore, deleteDoc ,collectionData, collection } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';

interface Item {
  id: string,
  // ...
};


@Component({
  selector: 'app-invoicetracker',
  templateUrl: './invoicetracker.component.html',
  styleUrls: ['./invoicetracker.component.css']
})
export class InvoicetrackerComponent implements OnInit {

  

  dashboard = true;
  dashboardData = 'Y';
  invoiceName = 'asddf';
  showAddInvoiceBox = false;
  showModal = false;
  pendingInvoiceItem:any;

  // item$: Observable<Item[]>;
  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore) {
    const Collection = collection(firestore, 'items');
    // this.item$ = collectionData(Collection);
  }

  paidItem: FormGroup = this.fb.group({
    paidDate: ['2022-03-19',Validators.required],
  });
  // paidDate = new FormControl(['2022-03-19',Validators.required]);

  invoiceItem: FormGroup = this.fb.group({
    invoiceNumber: ['TEST-1',Validators.required],
    invoiceDate: ['2022-03-19',Validators.required],
    paidDate: [''],
    billedTo: ['Preferred Materials, LLC',Validators.required],
    totalBilled:[12154,Validators.required],
  });
  
  invoices:any;
  invoicesSub:any;

  onSubmit(){
     
  }

  editPaidDate(invoice: any){
    this.pendingInvoiceItem = invoice;
    this.showModal = !this.showModal;
    console.log('edit paid',invoice);
  }

  setInvoicePaidDate(){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    this.pendingInvoiceItem.paidDate = this.paidItem.controls['paidDate'].value;
    invoiceCollection.doc(this.pendingInvoiceItem.id).set(this.pendingInvoiceItem);
    this.showModal = !this.showModal;
    this.paidItem.controls['paidDate'].reset();
  }

  ngOnInit(): void {
    console.log('INVOUICE ITEN',this.invoiceItem);
    this.invoicesSub =  this.afs.collection('Invoices').snapshotChanges().subscribe(changes =>{
      this.invoices =  changes.map(e =>{
        const data = e.payload.doc.data() as Item;
        data.id = e.payload.doc.id;
        return data;
      })
    });
    setTimeout(function(){
      // thisAll.invoicesSub.unsubscribe();
    },2000);
  }

  ngOnDestroy() {
    this.invoicesSub.unsubscribe();
  }

  updateName(e: any){
    console.log('updatename',e);
    this.invoiceName = e.target.value;
  }

  async deleteInvoice(item:any){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    console.log(item);
    var del = confirm('Are you sure you want to delete this invoice?');

    if(del){
      invoiceCollection.doc(item.id).delete();
    }
  }

  addItem(){
    console.log(this.invoiceItem,this.invoiceItem.value);
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    var invoiceItem = this.invoiceItem.value;
    var t = invoiceCollection.add(invoiceItem);
    this.invoiceItem.reset();
  }
}