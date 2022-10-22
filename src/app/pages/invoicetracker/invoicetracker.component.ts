import { Component, OnInit } from '@angular/core';
import { AngularFirestore} from '@angular/fire/compat/firestore';
import { Firestore, collection } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { orderBy, query,onSnapshot, getFirestore } from 'firebase/firestore';
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

  constructor(firestore: Firestore,private fb:FormBuilder,public afs:AngularFirestore,private router:Router) {
    //...
  }

  paidItem: FormGroup = this.fb.group({
    paidDate: ['2022-03-19',Validators.required],
  });

  invoiceItem: FormGroup = this.fb.group({
    invoiceNumber: ['',Validators.required],
    invoiceDate: ['',Validators.required],
    paidDate: [''],
    billedTo: ['',Validators.required],
    totalBilled:[null,Validators.required],
  });

  pdfDoc = new jsPDF;
  invoices:any;
  cachedData = true;
  invoicesSub:any;
  db = getFirestore()
  colRef = collection(this.db,'Invoices')
  q = query(this.colRef,orderBy('invoiceDate','desc'))


  ngOnInit(): void {
    var cachedInvoices = localStorage.getItem('invoices');
    if(cachedInvoices && cachedInvoices.length > 0){
      this.cachedData = true;
      this.invoices = JSON.parse(cachedInvoices);
      console.log('Invoices: Getting local data.')
    }else{
      this.cachedData = false;
      this.getInvoiceData();
    }
  }

  refreshClicked(){
    this.getInvoiceData();
    this.cachedData = false;
  }

  getInvoiceData(){
    console.log('GETTING NEW INVOICES!!!');
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.invoices = []
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id})
      });
      localStorage.setItem('invoices',JSON.stringify(this.invoices));
    });
  }

  onSubmit(){
    //
  }
  
  editInvoice(data:any){
    var conf = confirm('Are you sure you want to edit invoice '+data.invoiceNumber+'? (Michelle, you mess up???)');

    if(conf){
      if(data.invoiceData.hourly_wait_charge){
        this.router.navigate(['/createinvoiceload'],{state:{invoiceData:data.invoiceData}});
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
      this.pdfDoc.text("Total Extended Wait Hours",startingX+(xSpacing*2),startingY+(ySpacing*line));
      line++;

      this.pdfDoc.setFont("helvetica", "normal");
      this.pdfDoc.text(this.formatDateString(x.date),startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text(x.extended_wait_hours.toString(),startingX+(xSpacing*2),startingY+(ySpacing*line));
      line++;

      line++;
      
      var xSpacing = 26;
      this.pdfDoc.setFont("helvetica", "bold");
      this.pdfDoc.setFontSize(8);
      this.pdfDoc.text("Ticket No",startingX+(xSpacing*0),startingY+(ySpacing*line));
      this.pdfDoc.text("Plant Time In",startingX+(xSpacing*1),startingY+(ySpacing*line));
      this.pdfDoc.text("Plant First Load",startingX+(xSpacing*2),startingY+(ySpacing*line));
      this.pdfDoc.text("Plant Wait Time",startingX+(xSpacing*3),startingY+(ySpacing*line));
      this.pdfDoc.text("Site Arrival",startingX+(xSpacing*4),startingY+(ySpacing*line));
      this.pdfDoc.text("Site Leave",startingX+(xSpacing*5),startingY+(ySpacing*line));
      this.pdfDoc.text("Site Wait Time",startingX+(xSpacing*6),startingY+(ySpacing*line));
      line++;
      x.trips.forEach( (t:  any ) => {
        console.log(t);
        this.pdfDoc.setFont("helvetica", "normal");
        this.pdfDoc.text(t.ticket_number,startingX+(xSpacing*0),startingY+(ySpacing*line));
        this.pdfDoc.text(this.formatTimes(t.time_in_plant),startingX+(xSpacing*1),startingY+(ySpacing*line));
        this.pdfDoc.text(this.formatTimes(t.time_first_load),startingX+(xSpacing*2),startingY+(ySpacing*line));
        this.pdfDoc.text(t.plant_wait_hours,startingX+(xSpacing*3),startingY+(ySpacing*line));

        this.pdfDoc.text(this.formatTimes(t.time_arrived_site),startingX+(xSpacing*4),startingY+(ySpacing*line));
        this.pdfDoc.text(this.formatTimes(t.time_left_site),startingX+(xSpacing*5),startingY+(ySpacing*line));
        this.pdfDoc.text(t.site_wait_hours,startingX+(xSpacing*6),startingY+(ySpacing*line));
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

  buildFormTotalsLoad(invoice:any){
    this.pdfDoc.setFontSize(11);
    var startingY = this.lastDataLine;
    var ySpacing = 5;

    var xSpacing = 45;
    var startingX = 25;
    this.pdfDoc.line(55, startingY-5, 150, startingY-5);

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text("Charge Per Load",startingX+(xSpacing*0),startingY+(ySpacing),{align:"center"});
    this.pdfDoc.text("Gas Surcharge",startingX+(xSpacing*1),startingY+(ySpacing),{align:"center"});
    this.pdfDoc.text("Wait Charge",startingX+(xSpacing*2),startingY+(ySpacing),{align:"center"});
    // this.pdfDoc.text("Total Trips",startingX+(xSpacing*3),startingY+(ySpacing),{align:"center"});
    // this.pdfDoc.text("Extended Wait Hours",startingX+(xSpacing*3),startingY+(ySpacing),{align:"center"});
    this.pdfDoc.text("Total Charged",startingX+(xSpacing*3),startingY+(ySpacing),{align:"center"});

    this.pdfDoc.setFont("helvetica", "normal");
    this.pdfDoc.text('$'+invoice.load_charge.toString(),startingX+(xSpacing*0),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+invoice.gas_surcharge.toString(),startingX+(xSpacing*1),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+invoice.hourly_wait_charge.toString(),startingX+(xSpacing*2),startingY+(ySpacing+5),{align:"center"});
    // this.pdfDoc.text(invoice.total_trips.toString() ,startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
    // this.pdfDoc.text(invoice.total_wait_hours.toString() ,startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+invoice.total_charged.toString(),startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
  }
  // 

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
    console.log();
    this.pdfDoc = new jsPDF;
    this.pageAdded = false;
    if(invoice.hourly_wait_charge){
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

  editPaidDate(invoice: any){
    this.pendingInvoiceItem = invoice;
    this.showModal = !this.showModal;
  }

  setInvoicePaidDate(){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    this.pendingInvoiceItem.paidDate = this.paidItem.controls['paidDate'].value;
    invoiceCollection.doc(this.pendingInvoiceItem.id).set(this.pendingInvoiceItem);
    this.showModal = !this.showModal;
    this.paidItem.controls['paidDate'].reset();
  }

  ngOnDestroy() {
    // this.invoicesSub.unsubscribe();
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

  addItem(){
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    var invoiceItem = this.invoiceItem.value;
    var t = invoiceCollection.add(invoiceItem);
    this.invoiceItem.reset();
    if(this.cachedData == true){
      this.invoices = [invoiceItem].concat(this.invoices);
    }
  }
}