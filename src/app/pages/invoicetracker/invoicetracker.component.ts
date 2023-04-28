import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot,limit,where, getFirestore } from 'firebase/firestore';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';

interface Item {
  id: string,
  invoiceDate:string,
  totalBilled:number
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
  pageAdded = false;
  lastDataLine: number = 0;

  constructor(firestore: Firestore,private fb:UntypedFormBuilder,public afs:AngularFirestore,private router:Router) {
    //...
  }

  paidItem: UntypedFormGroup = this.fb.group({
    paidDate: ['',Validators.required],
  });

  invoiceItem: UntypedFormGroup = this.fb.group({
    invoiceNumber: ['',Validators.required],
    invoiceDate: ['',Validators.required],
    paidDate: [''],
    billedTo: ['',Validators.required],
    totalBilled:[null,Validators.required],
  });

  pdfDoc = new jsPDF;
  records:any = [];
  allRecords:any;
  cachedData = true;
  invoicesSub:any;
  total:any = 0;
  collectionName = 'Invoices';
  db = getFirestore();
  colRef = collection(this.db,'Invoices');
  filterProperty = 'invoiceNumber';

  currentSortDirection = true;
  sortProperty = 'item';
  currentPropDirection = '';

  ngOnInit(): void {
    

    var userAuth = localStorage.getItem('user');
    if(!userAuth){
      this.router.navigate(['/login']);
    }
    this.viewFromChanged('');
  }
  
  convertStringDateToInt(data:any){
    const invoiceCollection = this.afs.collection<Item>(this.collectionName);
    for(var i =0;i<data.length;i++){
      if(typeof data[i].invoiceDate == 'string'){
        var newInvoiceDate = Date.parse(data[i].invoiceDate);
        var updatedRec = data[i];
        updatedRec.invoiceDate = newInvoiceDate;
        if(typeof data[i].paidDate == 'string'){
          var newPaidDate = Date.parse(data[i].paidDate);
          updatedRec.paidDate = newPaidDate;
        console.log('new paidDate',data[i],newPaidDate,new Date(newPaidDate));

        }
        console.log('new invoiceDate',data[i],newInvoiceDate,new Date(newInvoiceDate));

        invoiceCollection.doc(updatedRec.id).update(updatedRec);
      }
    }
  }
  calculateTotal(recs:any){
    var recs = recs;
    this.total = 0;
    for(var i =0;i<recs.length;i++){
      this.total +=typeof this.records[i].totalBilled == 'string'?parseFloat(this.records[i].totalBilled):this.records[i].totalBilled;

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

    var invoicesColRef = collection(this.db,'Invoices');
    var invoicesQuery = query(invoicesColRef,orderBy('invoiceDate','desc'),where('invoiceDate', '>=', queryDate));
    if(e.target?.value == 'Last Year'){
      var d = new Date()
      var thisYear = new Date(d.getFullYear()+'-1-1');
      var endDate = Date.parse(thisYear.toString());
      invoicesQuery = query(invoicesColRef,orderBy('invoiceDate','desc'),where('invoiceDate', '>=', queryDate),where('invoiceDate', '<', endDate));
    }
    
    onSnapshot(invoicesQuery,(snapshot: { docs: any[]; }) => {
      this.records = []
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      })
      console.log('Invoices',this.records);
      this.allRecords = this.records;
      this.calculateTotal(this.records);
      if(this.records && typeof this.records[0].date == 'string'){
        this.convertStringDateToInt(this.records);
      }
    });
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
    this.calculateTotal(this.records);
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
    this.calculateTotal(this.records);
  }

  refreshClicked(){
    this.getInvoiceData();
    this.cachedData = false;
  }

  getInvoiceData(){
    // const thirtyDaysAgo = new Date();
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // var thirtyDaysAgoSecs = Date.now() - (86400*30*1000);
    var d = new Date()
    var thisYear = new Date(d.getFullYear()+'-1-1');
    var thisYearSecs = Date.parse(thisYear.toString());

    var invoicesColRef = collection(this.db,'Invoices');
    var invoicesQuery = query(invoicesColRef,orderBy('invoiceDate','desc'),where('invoiceDate', '>=', thisYearSecs));
    onSnapshot(invoicesQuery,(snapshot: { docs: any[]; }) => {
      this.records = [];
      snapshot.docs.forEach( (doc) => {
        this.records.push({...doc.data(), id:doc.id})
      });
      this.allRecords = this.records;
      console.log('GETTING NEW INVOICES!!!',this.records);
      if(this.records && typeof this.records[0].invoiceDate == 'string'){
        this.convertStringDateToInt(this.records);
      }
      localStorage.setItem('invoices',JSON.stringify(this.records));
    });
  }

  onSubmit(){
    //
  }
  
  editInvoice(data:any){
    console.log('editInvoice',data);
    var conf = confirm('Are you sure you want to edit invoice '+data.invoiceNumber+'? (Michelle, you mess up???)');

    if(conf){
      if(data.invoiceData.wait_charge){
        var editData = data.invoiceData;
        editData.paid_date = data.paidDate;
        this.router.navigate(['/createinvoiceload'],{state:{invoiceData:editData}});
      }else{
        this.router.navigate(['/createinvoice'],{state:{invoiceData:data.invoiceData}});
      }
    }
  }

  createInvoice(){
    this.router.navigate(['/createinvoice']);
    this.router.navigate(['/createinvoice'],{state:{data:'createinvoice'}});
  }

  createInvoicePerLoad(){
    this.router.navigate(['/createinvoiceload']);
    this.router.navigate(['/createinvoiceload'],{state:{data:'createinvoiceload'}});
  }

  formatDateString(d:string){
    var dateArr = d.split('-');

    var cutOff = dateArr.splice(0,1);
    dateArr = dateArr.concat(cutOff);
    dateArr.join('-');
    var newDateArr = dateArr.join('/');
    return newDateArr;
  }

  buildFormHeader(invoice: any){
    var startingY = 30;
    var ySpacing = 6;
    var startingX = 75;
    this.pdfDoc.setFontSize(50);
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text("Invoice",200,15+(ySpacing*1), {align:"right"});

    this.pdfDoc.addImage("../../assets/images/markPavingLogo.jpg", "JPEG", 10, 10, 55, 55);
    this.pdfDoc.setFontSize(13);
    this.pdfDoc.text("Invoice Number: ",startingX,startingY+(ySpacing*1));
    this.pdfDoc.text("Date: ",startingX,startingY+(ySpacing*2));
    this.pdfDoc.text("Bill To: ",startingX,startingY+(ySpacing*3));
    this.pdfDoc.text("Balance Due: ",startingX,startingY+(ySpacing*4));

    this.pdfDoc.setFont("helvetica", "normal");
    this.pdfDoc.text(invoice.invoice_number,200,startingY+(ySpacing*1),{align:"right"},null);
    this.pdfDoc.text(this.formatDateString(invoice.date),200,startingY+(ySpacing*2),{align:"right"});
    this.pdfDoc.text(invoice.bill_to,200,startingY+(ySpacing*3),{align:"right"});
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text('$'+ (typeof invoice.total_billed == 'number'?invoice.total_billed.toFixed(2):invoice.total_billed),200,startingY+(ySpacing*4), {align:"right"});

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text(this.formatDateString(invoice.date_start)+' - '+this.formatDateString(invoice.date_end),105,startingY+(ySpacing*7),{align:"center"});
  }


  buildFormDays(invoice:any){
    this.pdfDoc.setFontSize(12);
    var workDays = invoice.workDays;

    var startingY = 80;
    var ySpacing = 5;

    var line = 1;
    workDays.forEach( (x: any) => {
      if(this.pageAdded == false && line>30){
        this.pdfDoc.addPage();
        startingY = 15;
        line = 1;
        this.pageAdded= true;
      }else if(this.pageAdded == true && line>40){
        this.pdfDoc.addPage();
        startingY = 15;
        line = 1;
      }
      var startingX = 15;
      var xSpacing = 50;
      var startLine =startingY+(ySpacing*line);
      this.pdfDoc.setFont("helvetica", "bold");
      this.pdfDoc.setFontSize(11);
      this.pdfDoc.text("Date",startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text("Time In",startingX+(xSpacing*1),startingY+(ySpacing*line));
      this.pdfDoc.text("Time Out",startingX+(xSpacing*2),startingY+(ySpacing*line));
      this.pdfDoc.text("Total Hours",startingX+(xSpacing*3),startingY+(ySpacing*line));
      line++;

      this.pdfDoc.setFont("helvetica", "normal");
      this.pdfDoc.text(this.formatDateString(x.date),startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text( this.formatTimes(x.time_in) ,startingX+(xSpacing*1),startingY+(ySpacing*line));
      this.pdfDoc.text(this.formatTimes(x.time_out),startingX+(xSpacing*2),startingY+(ySpacing*line));
      this.pdfDoc.text(x.total_hours.toString(),startingX+(xSpacing*3),startingY+(ySpacing*line));
      line++;

      line++;
      
      var xSpacing = 55;
      this.pdfDoc.setFont("helvetica", "bold");
      this.pdfDoc.setFontSize(9);
      this.pdfDoc.text("Ticket No",startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text("Customer",startingX+(xSpacing*1),startingY+(ySpacing*line));
      this.pdfDoc.text("Destination",startingX+(xSpacing*2),startingY+(ySpacing*line));
      this.pdfDoc.text("City",startingX+(xSpacing*3),startingY+(ySpacing*line));
      line++;
      x.trips.forEach( (t:  any ) => {
        this.pdfDoc.setFont("helvetica", "normal");
        this.pdfDoc.text(t.ticket_no,startingX+(xSpacing*0),startingY+(ySpacing*line));
        this.pdfDoc.text(t.customer,startingX+(xSpacing*1),startingY+(ySpacing*line));
        this.pdfDoc.text(t.destination,startingX+(xSpacing*2),startingY+(ySpacing*line));
        this.pdfDoc.text(t.city.toString(),startingX+(xSpacing*3),startingY+(ySpacing*line));
        line++;
      });
      var endLine =(startingY+(ySpacing*line));
      this.pdfDoc.setLineWidth(0.5);
      this.pdfDoc.line(10, (startLine-4), 10, endLine-4);


      line++;
      line++;
    });
    this.lastDataLine = startingY+(ySpacing*line);
  }

  // BUILD FORM HEADER BY LOAD
  buildFormHeaderLoad(invoice:any){
    var startingY = 30;
    var ySpacing = 6;
    var startingX = 75;
    this.pdfDoc.setFontSize(50);
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text("Invoice",200,15+(ySpacing*1), {align:"right"});

    this.pdfDoc.addImage("../../assets/images/markPavingLogo.jpg", "JPEG", 10, 10, 55, 55);
    this.pdfDoc.setFontSize(13);
    this.pdfDoc.text("Invoice Number: ",startingX,startingY+(ySpacing*1));
    this.pdfDoc.text("Date: ",startingX,startingY+(ySpacing*2));
    this.pdfDoc.text("Bill To: ",startingX,startingY+(ySpacing*3));
    this.pdfDoc.text("Balance Due: ",startingX,startingY+(ySpacing*4));

    this.pdfDoc.setFont("helvetica", "normal");
    this.pdfDoc.text(invoice.invoice_number,200,startingY+(ySpacing*1),{align:"right"},null);
    this.pdfDoc.text(this.formatDateString(invoice.date),200,startingY+(ySpacing*2),{align:"right"});
    this.pdfDoc.text(invoice.bill_to,200,startingY+(ySpacing*3),{align:"right"});
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text('$'+ (typeof invoice.total_billed == 'number'?invoice.total_billed.toFixed(2):invoice.total_billed),200,startingY+(ySpacing*4), {align:"right"});

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text(this.formatDateString(invoice.date_start)+' - '+this.formatDateString(invoice.date_end),105,startingY+(ySpacing*7),{align:"center"});
  }

  buildFormDaysLoad(invoice:any){
    console.log(invoice);
    this.pdfDoc.setFontSize(12);
    var workDays = invoice.workDays;

    var startingY = 80;
    var ySpacing = 5;

    var line = 1;
    workDays.forEach( (x: any) => {
      if(this.pageAdded == false && line>30){
        this.pdfDoc.addPage();
        startingY = 15;
        line = 1;
        this.pageAdded= true;
      }else if(this.pageAdded == true && line>40){
        this.pdfDoc.addPage();
        startingY = 15;
        line = 1;
      }
      // header
      var startingX = 15;
      var xSpacing = 20;
      var startLine =startingY+(ySpacing*line);
      this.pdfDoc.setFont("helvetica", "bold");
      this.pdfDoc.setFontSize(11);
      this.pdfDoc.text("Date",startingX+(xSpacing*0),startingY+(ySpacing*line));
      line++;

      this.pdfDoc.setFont("helvetica", "normal");
      this.pdfDoc.text(this.formatDateString(x.date),startingX+(xSpacing*0),startingY+(ySpacing*line));
      line++;
      line++;

      var xSpacing = 5;
      this.pdfDoc.setFont("helvetica", "bold");
      this.pdfDoc.setFontSize(8);
      this.pdfDoc.text("Ticket No",startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text("Plant Extended Wait Hours",startingX+(xSpacing*5),startingY+(ySpacing*line));
      this.pdfDoc.text("Site Extended Wait Hours",startingX+(xSpacing*15),startingY+(ySpacing*line));
      this.pdfDoc.text("Miles to Site",startingX+(xSpacing*25),startingY+(ySpacing*line));
      line++;
      x.trips.forEach( (t:  any ) => {
        console.log(t);
        this.pdfDoc.setFont("helvetica", "normal");
        this.pdfDoc.text(''+t.ticket_number,startingX+(xSpacing*0),startingY+(ySpacing*line));
        this.pdfDoc.text(''+t.plant_wait_charge,startingX+(xSpacing*5),startingY+(ySpacing*line));
        this.pdfDoc.text(''+t.site_wait_charge,startingX+(xSpacing*15),startingY+(ySpacing*line));
        this.pdfDoc.text(''+t.miles+' mi',startingX+(xSpacing*25),startingY+(ySpacing*line));
        line++;
      });
      var endLine =(startingY+(ySpacing*line));
      this.pdfDoc.setLineWidth(0.5);
      this.pdfDoc.line(10, (startLine-4), 10, endLine-4);

      line++;
      line++;
    });

    //----------ADDITIONAL CHARGES------------// 
    var additionalChargeLine = startingY+(ySpacing*line);
    var ac = invoice.additionalCharges;
    if(this.pageAdded == false && (line+ac.length>30)){
      this.pdfDoc.addPage();
      startingY = 15;
      line = 1;
      this.pageAdded= true;
    }else if(this.pageAdded == true && (line+ac.length)>40){
      this.pdfDoc.addPage();
      startingY = 15;
      line = 1;
    }
    
    this.pdfDoc.line(55, additionalChargeLine-5, 150, additionalChargeLine-5);

    var startingX = 15;
    var xSpacing = 5;
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.setFontSize(11);
    line++;
    this.pdfDoc.text("Additional Charges",startingX+(xSpacing*0),startingY+(ySpacing*line));
    line++;
    line++;
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.setFontSize(8);
    this.pdfDoc.text("Date",startingX+(xSpacing*0),startingY+(ySpacing*line-1));
    this.pdfDoc.text("Amount",startingX+(xSpacing*5),startingY+(ySpacing*line-1));
    this.pdfDoc.text("Charge",startingX+(xSpacing*10),startingY+(ySpacing*line-1));
    line++;
    ac.forEach( (c: any) => {
      this.pdfDoc.setFont("helvetica", "normal");
      this.pdfDoc.text(''+c.date,startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text('$'+c.amount,startingX+(xSpacing*5),startingY+(ySpacing*line));
      this.pdfDoc.text(''+c.charge,startingX+(xSpacing*10),startingY+(ySpacing*line));

      line++;
    });
    line++;
    line++;
    this.lastDataLine = startingY+(ySpacing*line);
    this.pdfDoc.line(10,additionalChargeLine , 10, (startingY+line*ySpacing)-10);
    line++;
    line++;
    
  }

  buildFormTotalsLoad(invoice:any){
    this.pdfDoc.setFontSize(11);
    var startingY = this.lastDataLine;
    var ySpacing = 5;

    var xSpacing = 45;
    var startingX = 12;
    this.pdfDoc.line(55, startingY-5, 150, startingY-5);

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text("Total Charged",startingX+(xSpacing*2),startingY+(ySpacing),{align:"center"});

    this.pdfDoc.setFont("helvetica", "normal");
    this.pdfDoc.text('$'+invoice.total_charged.toString(),startingX+(xSpacing*2),startingY+(ySpacing+5),{align:"center"});
  }

  buildFormTotals(invoice:any){
    this.pdfDoc.setFontSize(11);
    var startingY = this.lastDataLine;
    var ySpacing = 5;

    var xSpacing = 40;
    var startingX = 25;
    this.pdfDoc.line(55, startingY-5, 150, startingY-5);

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text("Charge Per Hour",startingX+(xSpacing*1),startingY+(ySpacing),{align:"center"});
    this.pdfDoc.text("Total Hours",startingX+(xSpacing*2),startingY+(ySpacing),{align:"center"});
    this.pdfDoc.text("Total Charged",startingX+(xSpacing*3),startingY+(ySpacing),{align:"center"});

    this.pdfDoc.setFont("helvetica", "normal");
    this.pdfDoc.text('$'+invoice.charge_per_hour.toString(),startingX+(xSpacing*1),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text(invoice.total_hours.toString() ,startingX+(xSpacing*2),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+invoice.total_charged.toString(),startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
  }

  generatePDF(invoice:any){
    console.log('generatePDF',invoice);
    this.pdfDoc = new jsPDF;
    this.pageAdded = false;
    if(invoice.gas_surcharge){
      this.buildFormHeaderLoad(invoice);
      this.buildFormDaysLoad(invoice);
      this.buildFormTotalsLoad(invoice);
    }else{
      this.buildFormHeader(invoice);
      this.buildFormDays(invoice);
      this.buildFormTotals(invoice);
    }
    this.pdfDoc.save();
  }

  formatTimes(val: string){
    console.log(val);
    var timeArr = val.split(':');
    var fullHours = parseInt(timeArr[0]);

    var halfHours = fullHours>12?fullHours-12:fullHours;
    var mins = parseInt(timeArr[1]);

    var ampm = fullHours>12?'PM':'AM';
    var newTime = halfHours.toString()+':'+(mins>9?'':'0')+mins.toString()+' '+ampm;
    return newTime;
  }

  
  downloadInvoice(invoice: any){
    this.generatePDF(invoice);
  }

  clearPaid(){
    this.paidItem.reset();
  }

  editPaidDate(invoice: any){
    this.pendingInvoiceItem = invoice;
    this.showModal = !this.showModal;
  }

  setInvoicePaidDate(){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    this.pendingInvoiceItem.paidDate = this.getDatePickerSeconds(this.paidItem.controls['paidDate'].value);
    invoiceCollection.doc(this.pendingInvoiceItem.id).set(this.pendingInvoiceItem);
    this.showModal = !this.showModal;
    this.paidItem.controls['paidDate'].reset();
  }

  ngOnDestroy() {
    // this.recordsSub.unsubscribe();
  }

  async deleteInvoice(item:any){
    console.log(item);
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    var del = confirm('Are you sure you want to delete invoice '+item.invoiceNumber+'?');
    
    if(del){
      invoiceCollection.doc(item.id).delete();
      this.refreshClicked();
    }
  }
  getDatePickerSeconds(datePickerValue:any){
    var d = new Date(datePickerValue);
    d.setDate(d.getDate()+1);
    return Date.parse(d.toString());
  }

  addItem(){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    var invoiceItem = this.invoiceItem.value;
    console.log(this.invoiceItem.value);
    invoiceItem.invoiceDate = this.getDatePickerSeconds(invoiceItem.invoiceDate);
    var t = invoiceCollection.add(invoiceItem);
    console.log(invoiceItem);
    this.invoiceItem.reset();
    if(this.cachedData == true){
      this.records = [invoiceItem].concat(this.records);
    }
  }
}