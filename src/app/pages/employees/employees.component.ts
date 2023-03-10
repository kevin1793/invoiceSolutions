import { Component, OnInit  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy,limit, query,onSnapshot, getFirestore } from 'firebase/firestore';
import { Router } from '@angular/router';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { collection } from '@angular/fire/firestore';

interface Record {
  firstName: string,
  lastName:string,
  middleName: string,
  notes :string,
  workType: string,
  status:string,
  compensationType: string,
  compensation:number,
  employeeID:string,
  createdDate:Date,
  address1:string,
  address2:string,
  state:string,
  zip:string,
  city:string,
  id:string,
  phone:string,
  email:string,
  // ...
};

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent {

  recordItem: UntypedFormGroup = this.fb.group({
    employeeID: [''],
    firstName: ['',Validators.required],
    middleName: [''],
    status: [''],
    lastName: [null,Validators.required],
    workType: [null,Validators.required],
    createdDate: [Date()],
    hiredDate: [Date()],
    compensationType: [''],
    compensation: [null],
    notes :[''],
    address1 :[''],
    address2 :[''],
    state :[''],
    city :[''],
    zip :[''],
    phone :[''],
    email :[''],
  });

  editItem: UntypedFormGroup = this.fb.group({
    employeeID: [''],
    firstName: ['',Validators.required],
    middleName: [''],
    status: [''],
    lastName: [null,Validators.required],
    workType: [null,Validators.required],
    createdDate: [Date()],
    hiredDate: [Date()],
    compensationType: [''],
    compensation: [null],
    notes :[''],
    address1 :[''],
    address2 :[''],
    state :[''],
    city :[''],
    zip :[''],
    phone :[''],
    email :[''],
  });

  recordEdit:Record | any;
  dashboard = true;
  showInfoBox = false;
  dashboardData = 'Y';
  showAddRecordBox = false;
  collectionName = 'Employees';
  filterProperty = 'item';

  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  records:any;
  allRecords:any;
  infoRec:any;

  constructor(private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) { }

  db = getFirestore();
  colRef = collection(this.db,this.collectionName);
  q = query(this.colRef,orderBy('employeeID','desc'),limit(25));

  ngOnInit(): void {
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      this.allRecords = this.records;
      console.log('RECORDS',this.records);
    });
  }

  modalClicked(e:any){
    console.log('modalClicked',e.target?.id);
    if(e.target?.id){
      this.showInfoBox = !this.showInfoBox;
    }
  }

  infoClicked(rec:any){
    this.infoRec = rec;
    console.log('SHOW INFO',rec);
    this.showInfoBox = !this.showInfoBox;
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

  async deleteRecord(item:any){
    const collection = this.afs.collection<Record>(this.collectionName);
    var del = confirm('Are you sure you want to delete the employee '+item.firstName+' '+item.lastName+'?');

    if(del){
      collection.doc(item.id).delete();
    }
  }

  editRecordClicked(rec:any){
    console.log('editRecordClicked',rec);
    this.recordEdit = rec;
    this.editItem.patchValue(rec);
  }

  updateRecord(rec:Record,e:any){
    console.log('updateRecord',e,rec,this.editItem);
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var updatedRec  = rec;
    invoiceCollection.doc(updatedRec.id).update(this.editItem.value);
    this.recordEdit = null;
  }

  filterPropertyChanged(e:any){
    console.log('filterPropertyChanged',e);
    this.filterProperty = e.srcElement.value;
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

  addRecord(){
    const invoiceCollection = this.afs.collection<Record>(this.collectionName);
    var recordItem = this.recordItem.value;
    var d = new Date();
    // recordItem.modified = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var t = invoiceCollection.add(recordItem);
    this.recordItem.reset();
  }

}
