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
  invoicesSub:any;
  db = getFirestore()
  colRef = collection(this.db,'Invoices')
  q = query(this.colRef,orderBy('invoiceDate','desc'))


  ngOnInit(): void {
    onSnapshot(this.q,(snapshot: { docs: any[]; }) => {
      this.invoices = []
      snapshot.docs.forEach( (doc) => {
        this.invoices.push({...doc.data(), id:doc.id})
      })
      console.log(this.invoices);
    })
    return;
  }

  onSubmit(){
    //
  }
  
  editInvoice(data:any){
    console.log('edit invoice',data);
    var conf = confirm('Are you sure you want to edit invoice '+data.invoiceNumber+'? (Michelle, you mess up???)');

    if(conf){
      this.router.navigate(['/createinvoice'],{state:{invoiceData:data.invoiceData}});
    }
  }

  formatDateString(d:string){
    var dateArr = d.split('-');
    console.log('date arr',dateArr);

    var cutOff = dateArr.splice(0,1);
    dateArr = dateArr.concat(cutOff);
    dateArr.join('-');
    var newDateArr = dateArr.join('/');
    console.log('date arr',newDateArr);
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
    console.log('buildFormDays',workDays);

    var startingY = 80;
    var ySpacing = 5;

    var line = 1;
    workDays.forEach( (x: any) => {
      console.log('Workday start',line);
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
        console.log('Trip start start',line);
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

  buildFormTotals(invoice:any){
    this.pdfDoc.setFontSize(11);
    // console.log('build form totals',this.invoiceForm.value);
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
    this.pdfDoc = new jsPDF;
    this.pageAdded = false;
    this.buildFormHeader(invoice);
    this.buildFormDays(invoice);
    this.buildFormTotals(invoice);
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
    console.log('edit paid',invoice);
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
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    console.log(item);
    var del = confirm('Are you sure you want to delete invoice '+item.invoiceNumber+'?');

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