import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { collection } from '@angular/fire/firestore';


interface Record {
  subject: string,
  message:string,
  type:string,
  createdDate: string,
  notes :string,
  // ...
};

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent {

  constructor(private fb:UntypedFormBuilder,public afs:AngularFirestore){

  }

  recordItem: UntypedFormGroup = this.fb.group({
    subject: [''],
    message: [''],
    createdDate: [''],
    type: [''],
    notes: [''],
  });

  records:any;
  allRecords:any;
  infoRec:any;

  dashboard = true;
  showInfoBox = false;
  dashboardData = 'Y';
  showAddRecordBox = false;
  collectionName = 'Announcements';
  filterProperty = 'item';

  db = getFirestore();
  colRef = collection(this.db,this.collectionName);
  q = query(this.colRef,orderBy('createdDate','desc'),limit(25));

  ngOnInit(){
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      this.allRecords = this.records;
      console.log('RECORDS',this.records);
    });
  }
  async deleteRecord(item:any){
    const collection = this.afs.collection<Record>(this.collectionName);
    var del = confirm('Are you sure you want to delete the Announcement '+item.subject+' from '+(item.createdDate)+'?');

    if(del){
      collection.doc(item.id).delete();
    }
  }
  addRecord(){
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var recordItem = this.recordItem.value;
    var d = new Date();
    recordItem.createdDate = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var t = invoiceCollection.add(recordItem);
    this.recordItem.reset();
  }
  addRecordClicked(){
    this.recordItem.reset();
  }
}


