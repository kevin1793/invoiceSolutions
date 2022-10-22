import { Component, ElementRef, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, FormBuilder, FormArray, NgControl, Validators } from '@angular/forms';
import { CellConfig, jsPDF } from 'jspdf';


interface Item {
  id: string,
  invoiceDate:string,
  totalBilled:number
  // ...
};


@Component({
  selector: 'app-createinvoice',
  templateUrl: './createinvoiceload.component.html',
  styleUrls: ['./createinvoiceload.component.css']
})
export class CreateinvoiceloadComponent implements OnInit {

  constructor(private fb:FormBuilder,public afs:AngularFirestore) { }
  dashboard = true;
  dashboardData = 'Y';

  lastDataLine: number = 0;

  invoiceForm: FormGroup = this.fb.group({
    invoice_number: ['',Validators.required],
    date_start: ['',Validators.required],
    date_end: ['',Validators.required],
    date: ['',Validators.required],
    total_wait_hours:[0],
    total_trips:[0],
    total_charged:[0],
    total_billed:[0],
    bill_to:['Preferred Materials, LLC'],
    workDays:this.fb.array([this.newWorkDay()]),
    gas_surcharge:[35],
    load_charge:[265],
    hourly_wait_charge:[75],
  });

  invoiceItem: FormGroup = this.fb.group({
    invoiceNumber: ['',Validators.required],
    invoiceDate: ['',Validators.required],
    paidDate: [''],
    billedTo: ['',Validators.required],
    totalBilled:[null,Validators.required],
    invoiceData:['']
  });

  pdfDoc = new jsPDF;
  dateToday = new Date();
  pageAdded = false;
    
  ngOnInit(): void {
    console.log(history);
    if(history.state.invoiceData){
      this.loadInvoice(history.state.invoiceData);
    }
  }

  loadInvoice(data:any){
    console.log('loadInvoice',data);
    if(data){
      this.invoiceForm.get('invoice_number')?.setValue(data.invoice_number);
      this.invoiceForm.get('date')?.setValue(data.date);
      this.invoiceForm.get('date_start')?.setValue(data.date_start);
      this.invoiceForm.get('date_end')?.setValue(data.date_end);
      this.invoiceForm.get('total_hours')?.setValue(data.total_hours);
      this.invoiceForm.get('total_charged')?.setValue(data.total_charged);
      this.invoiceForm.get('total_billed')?.setValue(data.total_billed);
      this.invoiceForm.get('bill_to')?.setValue(data.bill_to);
      this.invoiceForm.get('charge_per_hour')?.setValue(data.charge_per_hour);
    }

    for(var i=0; i<data.workDays.length;i++){
      if(i !=0){
        this.addWorkDay();
      }
      var wd = this.invoiceForm.get('workDays') as FormArray;
      // wd.at(i).get('time_in')?.setValue(data.workDays[i].time_in);
      // wd.at(i).get('time_out')?.setValue(data.workDays[i].time_out);
      

      for(var j=0; j<data.workDays[i].trips.length;j++){
        if(j !=0){
          this.addTrip(i);
        }
        var trip = wd.at(i).get('trips') as FormArray;
        console.log('trips',trip);
        // trip.at(j).get('city')?.setValue(data.workDays[i].trips[j].city);
        trip.at(j).get('time_left_site')?.setValue(data.workDays[i].trips[j].time_left_site);
        trip.at(j).get('time_arrived_site')?.setValue(data.workDays[i].trips[j].time_arrived_site);
        trip.at(j).get('time_first_load')?.setValue(data.workDays[i].trips[j].time_first_load);
        trip.at(j).get('time_in_plant')?.setValue(data.workDays[i].trips[j].time_in_plant);
        trip.at(j).get('ticket_number')?.setValue(data.workDays[i].trips[j].ticket_number);
        trip.at(j).get('site_wait_hours')?.setValue(data.workDays[i].trips[j].site_wait_hours);
        trip.at(j).get('plant_wait_hours')?.setValue(data.workDays[i].trips[j].plant_wait_hours);

        this.calculateWorkDayExtendedWaitHours(i,j);
      }
      wd.at(i).get('date')?.setValue(data.workDays[i].date);
      wd.at(i).get('extended_wait_hours')?.setValue(data.workDays[i].extended_wait_hours);
      this.calculateTotalCharged();

    }
  }

  addInvoice(){
    var invoiceData = this.invoiceForm.value;
    const invoiceCollection = this.afs.collection<Item>('Invoices');
    // var invoiceItem = this.invoiceItem.value;
    this.invoiceItem.get('invoiceNumber')?.setValue(this.invoiceForm.value.invoice_number);
    this.invoiceItem.get('invoiceDate')?.setValue(this.invoiceForm.value.date);
    this.invoiceItem.get('paidDate')?.setValue(null);
    this.invoiceItem.get('billedTo')?.setValue(this.invoiceForm.value.bill_to);
    this.invoiceItem.get('totalBilled')?.setValue(this.invoiceForm.value.total_billed);
    this.invoiceItem.get('invoiceData')?.setValue(invoiceData);
    var addInv = confirm('Are you sure you want to add invoice '+this.invoiceForm.value.invoice_number+'?');

    if(addInv){
      invoiceCollection.add(this.invoiceItem.value);
      alert('Invoice was added.');
    }

  }

  formatDateString(d:string){
    var dateArr = d.split('-');
    var cutOff = dateArr.splice(0,1);
    dateArr = dateArr.concat(cutOff);
    dateArr.join('-');
    var newDateArr = dateArr.join('/');
    return newDateArr;
  }

  

  formatTimes(val: string){
    console.log('formatTimes',val);
    var timeArr = val.split(':');
    var fullHours = parseInt(timeArr[0]);

    var halfHours = fullHours>12?fullHours-12:fullHours;
    var mins = parseInt(timeArr[1]);

    var ampm = fullHours>12?'PM':'AM';
    var newTime = halfHours.toString()+':'+(mins>9?'':'0')+mins.toString()+' '+ampm;
    return newTime;
  }

  onSubmit(){
  }

  moveTrip(shift: any, wdInd:any, currentIndex: any){
    var trip = this.workDays().at(wdInd).get('trips') as FormArray;
    let newIndex: number = currentIndex + shift;
    if(newIndex === -1) {
      newIndex = trip.length - 1;
    } else if(newIndex == trip.length) {
      newIndex = 0;
    }
    const currentGroup = trip.at(currentIndex);
    trip.removeAt(currentIndex);
    trip.insert(newIndex, currentGroup);
  }

  moveWorkDay(shift: any,currentIndex: any){
    var wd = this.workDays() as FormArray;
    let newIndex: number = currentIndex + shift;
    if(newIndex === -1) {
      newIndex = wd.length - 1;
    } else if(newIndex == wd.length) {
      newIndex = 0;
    }
    const currentGroup = wd.at(currentIndex);
    wd.removeAt(currentIndex);
    wd.insert(newIndex, currentGroup);
  }

  addNewPage(){

  }

  buildFormHeader(){
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

    this.pdfDoc.setFont("helvetica", "bold");
    this.pdfDoc.text(this.formatDateString(this.invoiceForm.value.date_start)+' - '+this.formatDateString(this.invoiceForm.value.date_end),105,startingY+(ySpacing*7),{align:"center"});
  }

  buildFormDays(){
    this.pdfDoc.setFontSize(12);
    var workDays = this.invoiceForm.get('workDays')?.value;

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

  buildFormTotals(){
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
    this.pdfDoc.text('$'+this.invoiceForm.value.load_charge.toString(),startingX+(xSpacing*0),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+this.invoiceForm.value.gas_surcharge.toString(),startingX+(xSpacing*1),startingY+(ySpacing+5),{align:"center"});
    this.pdfDoc.text('$'+this.invoiceForm.value.hourly_wait_charge.toString(),startingX+(xSpacing*2),startingY+(ySpacing+5),{align:"center"});
    // this.pdfDoc.text(this.invoiceForm.value.total_trips.toString() ,startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
    // this.pdfDoc.text(this.invoiceForm.value.total_wait_hours.toString() ,startingX+(xSpacing*3),startingY+(ySpacing+5),{align:"center"});
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
      trips:this.fb.array([this.newTrip()]),
      extended_wait_hours: [{value:'',readonly:true},Validators.required],
    })
  }

  newTrip():FormGroup{
    return this.fb.group({
      ticket_number: ['',Validators.required],
      time_in_plant: ['',Validators.required],
      time_first_load: ['',Validators.required],
      plant_wait_hours: [{value:'',readonly:true},Validators.required],

      time_arrived_site: ['',Validators.required],
      time_left_site: ['',Validators.required],
      site_wait_hours: [{value:'',readonly:true},Validators.required],
    });
  }

  calculateWaitHours(i:number,j:number){
    var plantArrivedTime = this.workDayTrips(i).at(j).value.time_in_plant.split(':');
    var plantArrivedFloat = parseFloat(plantArrivedTime[0])+(parseFloat(plantArrivedTime[1])/60);
    var firstLoadTime = this.workDayTrips(i).at(j).value.time_first_load.split(':');
    var firstLoadFloat = parseFloat(firstLoadTime[0])+(parseFloat(firstLoadTime[1])/60);

    var siteArrivedTime = this.workDayTrips(i).at(j).value.time_arrived_site.split(':');
    var siteArriveFloat = parseFloat(siteArrivedTime[0])+(parseFloat(siteArrivedTime[1])/60);
    var siteLeftTime = this.workDayTrips(i).at(j).value.time_left_site.split(':');
    var siteLeftFloat = parseFloat(siteLeftTime[0])+(parseFloat(siteLeftTime[1])/60);

    if(firstLoadFloat> plantArrivedFloat){
      this.workDayTrips(i).at(j).get('plant_wait_hours')?.setValue((firstLoadFloat-plantArrivedFloat).toFixed(2));
    }else{
      this.workDayTrips(i).at(j).get('plant_wait_hours')?.setValue('');
    }

    if(siteLeftFloat> siteArriveFloat){
      this.workDayTrips(i).at(j).get('site_wait_hours')?.setValue((siteLeftFloat-siteArriveFloat).toFixed(2));
    }else{
      this.workDayTrips(i).at(j).get('site_wait_hours')?.setValue('');
    }

    if(siteLeftFloat&& siteArriveFloat && siteLeftFloat&& siteArriveFloat){
      this.calculateWorkDayExtendedWaitHours(i,j);
      this.calculateTotalCharged();
    }
  }

  calculateWorkDayExtendedWaitHours(i:number,j:number){
    console.log('workday',this.workDays().at(i));
    var trips = this.workDays().at(i).value.trips;
    var totalExtendedHours = 0;
    trips.forEach((x: any) => {
      console.log(x);
      if(x.plant_wait_hours >= 1){
        totalExtendedHours += Math.floor(parseFloat(x.plant_wait_hours));
        console.log('test',Math.floor(parseFloat(x.plant_wait_hours)));
      }
      if(x.plant_wait_hours >= 1){
        totalExtendedHours += Math.floor(parseFloat(x.site_wait_hours));
      }
    });
    console.log('totalExtendedHours',totalExtendedHours);
    this.workDays().at(i).get('extended_wait_hours')?.setValue((totalExtendedHours).toFixed(2));
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
    var totalHours = 0;
    this.workDays().controls.forEach(x => {
      totalHours += parseFloat(x.value.total_hours);
    });
    this.invoiceForm.get('total_hours')?.setValue(totalHours.toFixed(2));
    this.calculateTotalCharged();
  }

  calculateTotalCharged(){
    console.log('calculateTotalCharged',this.workDays());
    var wd = this.workDays().value;
    var totalTrips = 0;
    var totalWaitHours = 0;

    wd.forEach((x: any) => {
      totalTrips += x.trips.length;
      totalWaitHours += parseFloat(x.extended_wait_hours);
    });
    if(totalTrips >0){
      var gasCharge = this.invoiceForm.get('gas_surcharge')?.value;
      var loadCharge = this.invoiceForm.get('load_charge')?.value;
      var waitCharge = this.invoiceForm.get('hourly_wait_charge')?.value;
      var charge = (totalTrips*gasCharge)+(totalTrips*loadCharge)+(totalWaitHours*waitCharge);
      this.invoiceForm.get('total_charged')?.setValue(charge.toFixed(2));
      this.invoiceForm.get('total_billed')?.setValue(charge.toFixed(2));

      this.invoiceForm.get('total_wait_hours')?.setValue(totalWaitHours);
      this.invoiceForm.get('total_trips')?.setValue(totalTrips);
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
