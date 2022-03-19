import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray, NgControl, Validators } from '@angular/forms';
import { CellConfig, jsPDF } from 'jspdf';

@Component({
  selector: 'app-createinvoice',
  templateUrl: './createinvoice.component.html',
  styleUrls: ['./createinvoice.component.css']
})
export class CreateinvoiceComponent implements OnInit {

  constructor(private fb:FormBuilder) { }
  dashboard = true;
  dashboardData = 'Y';
  invoiceName = 'asddf';

  lastDataLine: number = 0;

  invoiceForm: FormGroup = this.fb.group({
    invoice_number: ['',Validators.required],
    date_start: ['',Validators.required],
    date_end: ['',Validators.required],
    date: ['',Validators.required],
    total_hours:[0],
    total_charged:[0],
    total_billed:[0],
    bill_to:['Preferred Materials, LLC'],
    charge_per_hour:[100,Validators.required],

    workDays:this.fb.array([this.newWorkDay()])
  });

  pdfDoc = new jsPDF;
  dateToday = new Date();
  pageAdded = false;
    
  ngOnInit(): void {
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

  buildFormHeader(){
    console.log('buildFormHeader',this.invoiceForm.value);
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
    this.pdfDoc.text(this.invoiceForm.value.invoice_number,200,startingY+(ySpacing*1),{align:"right"},null);
    this.pdfDoc.text(this.formatDateString(this.invoiceForm.value.date),200,startingY+(ySpacing*2),{align:"right"});
    this.pdfDoc.text(this.invoiceForm.value.bill_to,200,startingY+(ySpacing*3),{align:"right"});
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text('$'+ (typeof this.invoiceForm.value.total_billed == 'number'?this.invoiceForm.value.total_billed.toFixed(2):this.invoiceForm.value.total_billed),200,startingY+(ySpacing*4), {align:"right"});

    //
    console.log('',this.invoiceForm);
    console.log(this.invoiceForm.get('workDays'));
    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text(this.formatDateString(this.invoiceForm.value.date_start)+' - '+this.formatDateString(this.invoiceForm.value.date_end),105,startingY+(ySpacing*7),{align:"center"});
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

  onSubmit(){
    console.log('1');
  }

  addNewPage(){

  }

  buildFormDays(){
    this.pdfDoc.setFontSize(12);
    var workDays = this.invoiceForm.get('workDays')?.value;
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

  buildFormTotals(){
    this.pdfDoc.setFontSize(11);
    console.log('build form totals',this.invoiceForm.value);
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
    this.pdfDoc.text('$'+this.invoiceForm.value.charge_per_hour.toString(),startingX+(xSpacing*1),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text(this.invoiceForm.value.total_hours.toString() ,startingX+(xSpacing*2),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+this.invoiceForm.value.total_charged.toString(),startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
  }

  generatePDF(){
    this.pdfDoc = new jsPDF;
    this.pageAdded = false;
    this.buildFormHeader();
    this.buildFormDays();
    this.buildFormTotals();
    this.pdfDoc.save();
  }


  newWorkDay():FormGroup{
    return this.fb.group({
      date: ['',Validators.required],
      time_in: ['',Validators.required],
      time_out: ['',Validators.required],
      total_hours: [0,Validators.required],
      trips:this.fb.array([this.newTrip()])
    })
  }

  newTrip():FormGroup{
    return this.fb.group({
      ticket_no: ['',Validators.required],
      customer: ['',Validators.required],
      destination: ['',Validators.required],
      city: ['',Validators.required],
    })
  }

  timeChange(i:number){
    var timeInVal = (this.workDays().at(i).value.time_in).split(':');
    var timeInFloat = parseFloat(timeInVal[0])+(parseFloat(timeInVal[1])/60);
    var timeOutVal = (this.workDays().at(i).value.time_out).split(':');
    var timeOutFloat = parseFloat(timeOutVal[0])+(parseFloat(timeOutVal[1])/60);
    if(timeOutFloat> timeInFloat){
      this.workDays().at(i).get('total_hours')?.setValue((timeOutFloat-timeInFloat).toFixed(2));
      this.calculateAllHours();
    }else{
      this.workDays().at(i).get('total_hours')?.setValue('');
    }
  }

  calculateAllHours(){
    console.log('calculateAllHours');
    var totalHours = 0;
    this.workDays().controls.forEach(x => {
      console.log(x);
      totalHours += parseFloat(x.value.total_hours);
    });
    console.log('total_hours',totalHours);
    this.invoiceForm.get('total_hours')?.setValue(totalHours.toFixed(2));
    this.calculateTotalCharged();
  }

  calculateTotalCharged(){
    var totalHours = parseFloat(this.invoiceForm.get('total_hours')?.value);
    var chargePerHour = parseFloat(this.invoiceForm.get('charge_per_hour')?.value);
    if(chargePerHour && totalHours){
      var total_charged = (chargePerHour*totalHours).toFixed(2);
      this.invoiceForm.get('total_charged')?.setValue(total_charged);
      this.invoiceForm.get('total_billed')?.setValue(total_charged);
    }
  }

  workDays(){
    return this.invoiceForm.get('workDays') as FormArray;
  }

  workDayTrips(empIndex:number){
    return this.workDays().at(empIndex).get('trips') as FormArray;
  }

  addTrip(empIndex:number){
    this.workDayTrips(empIndex).push(this.newTrip());
  }

  removeTrip(empIndex:number,j:number){
    this.workDayTrips(empIndex).removeAt(j);
  }

  removeWorkDay(ele:any,i:number){
    var thisAll = this;
    console.log(ele);
    setTimeout(function(){
      thisAll.workDays().removeAt(i);
    },200);
  }

  addWorkDay(){
    this.workDays().push(this.newWorkDay());
    setTimeout(function(){
      window.scroll({
        top: 100000,
        behavior: 'smooth'
      });
    },100);
  }
}