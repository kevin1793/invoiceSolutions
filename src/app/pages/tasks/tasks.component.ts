import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { collection } from '@angular/fire/firestore';

interface Record {
  task: string,
  completedDate:Date,
  createdDate: Date,
  id :string,
  completed:boolean
  // ...
};

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {

  recordItem: UntypedFormGroup = this.fb.group({
    task: [''],
    completedDate: [''],
    createdDate: [''],
    completed:['']
  });

  constructor(private fb:UntypedFormBuilder,public afs:AngularFirestore){

  }

  records:any = [];
  allRecords:any;
  infoRec:any;

  dashboard = true;
  showInfoBox = false;
  dashboardData = 'Y';
  showAddRecordBox = false;
  collectionName = 'Tasks';
  // filterProperty = 'item';
  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  db = getFirestore();
  colRef = collection(this.db,this.collectionName);
  q = query(this.colRef,orderBy('createdDate','desc'));

  ngOnInit(){
    this.records =[];
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      this.allRecords = this.records;
      console.log('RECORDS',this.records);
    });
  }
  filterTasks(e:any){
    console.log('filterCHange',e);
    var val = e.target.value;
    if(val == 'Done'){
      this.records = this.allRecords.filter((item:any) => 
      item.completed == true
        )
      .map((item:any) => (item));
    }else if(val == 'Not Done'){
      this.records = this.allRecords.filter((item:any) => 
        item.completed == false
        )
      .map((item:any) => (item));
    }else{
      this.records = this.allRecords;
    }
  }
  sortPropertyChanged(prop:string){
    console.log('sortProperty',prop);
    this.currentSortDirection = !this.currentSortDirection;
    this.sortProperty = prop;
    this.records = this.records.sort((a:any, b:any) => this.compare(a, b, this.sortProperty));
    console.log(this.records);
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
  completeTask(rec:any){
    console.log('completeTask',rec);
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var updatedRec  = rec;
    updatedRec.completedDate = Date();
    updatedRec.completed = true;
    invoiceCollection.doc(updatedRec.id).update(updatedRec);
  }
  uncompleteTask(rec:any){
    console.log('completeTask',rec);
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var updatedRec  = rec;
    updatedRec.completedDate = null;
    updatedRec.completed = false;
    invoiceCollection.doc(updatedRec.id).update(updatedRec);
  }
  async deleteRecord(item:any){
    const collection = this.afs.collection<Record>(this.collectionName);
    var del = confirm('Are you sure you want to delete the Task `'+item.task+'`?');

    if(del){
      collection.doc(item.id).delete();
    }
  }
  addRecord(){
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var recordItem = this.recordItem.value;
    recordItem.createdDate = Date.now();
    recordItem.completed = false;
    var t = invoiceCollection.add(recordItem);
    this.recordItem.reset();
  }
  addRecordClicked(){
    this.recordItem.reset();
  }

}
