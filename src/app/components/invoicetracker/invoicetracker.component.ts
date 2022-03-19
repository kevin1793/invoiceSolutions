import { Component, OnInit,Injectable } from '@angular/core';
import { AngularFirestore,AngularFirestoreDocument} from '@angular/fire/compat/firestore';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

interface Item {
  // name: string
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

  item$: Observable<Item[]>;
  constructor(firestore: Firestore,public fireServices:AngularFirestore) {
    const Collection = collection(firestore, 'items');
    this.item$ = collectionData(Collection);
  }
  invoices:any;
  invoicesSub:any;

  ngOnInit(): void {
    this.invoicesSub =  this.fireServices.collection('Invoices').valueChanges().subscribe(data =>{
      this.invoices = data.map(e =>{
        return e;
      })
    });
    var thisAll = this;
    setTimeout(function(){
      thisAll.invoicesSub.unsubscribe();
    },2000);
  }

  ngOnDestroy() {
    this.invoicesSub.unsubscribe()
}

  updateName(e: any){
    console.log('updatename',e);
    this.invoiceName = e.target.value;
  }

  addItem(){
    console.log(this.invoiceName);
    // return;
    
    this.invoices.add({name:this.invoiceName});
  }
  async getDocs(){
    // const docRef = doc(db, "cities", "SF");
    // const docSnap = await getDoc(docRef);

    // if (docSnap.exists()) {
    //   console.log("Document data:", docSnap.data());
    // } else {
    //   // doc.data() will be undefined in this case
    //   console.log("No such document!");
    // }
  }

}
