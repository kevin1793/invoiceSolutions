import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit ,Input, ElementRef,Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

const fadeInOut = trigger('fadeInOut',[
  state(
    'open',style({
      opacity:1,
      width:'auto',
      height:'100%',
    })
  ),
  state(
    'close',style({
      width:'40px',
      opacity:0,
      height:'50px',
      visibility:'hidden',
    })
  ),
  transition('open => close',[animate('.5s ease-in')]),
  transition('close => open',[animate('.5s  ease-out')]),
])


@Component({
  selector: 'app-sidemenu',
  animations:[fadeInOut],
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  navOpened =  false;
  dashboard = false;
  @Output() currentFeature = new EventEmitter<string>();
  @Input() dashboardData: any;

  constructor(private router:Router, private elementRef: ElementRef) {

  }

    

  ngOnInit(): void {
    if(this.dashboardData && this.dashboardData == 'Y'){
      this.dashboard = true;
    }
    if(window.location.pathname == '/create-invoice'){
      this.closeMenu();
    }
    //TODO: add verification here to see in user has logged in
  }

  toExpenses(){
    if(window.location.pathname != '/expenses'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/expenses'],{state:{data:'expenses'}});
    this.closeMenu();
  }

  toTrucks(){
    if(window.location.pathname != '/trucks'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/trucks'],{state:{data:'trucks'}});
    this.closeMenu();
  }
  toFuel(){
    if(window.location.pathname != '/fuel'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/fuel'],{state:{data:'fuel'}});
    this.closeMenu();
  }

  currentFeatureChange(value:string){
    this.currentFeature.emit(value);
  }

  closeMenu(){
    this.navOpened = false;
  }

  openMenu(ele: any){
    this.navOpened = true;
  }

  testfunc(){

  }

  goToPage(pageName:string){
    if(window.location.pathname != '/'+pageName){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/'+pageName],{state:{data:pageName}});
    this.closeMenu();
  }

  goToLoginPage(){
    if(window.location.pathname != '/login'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/login'],{state:{data:'login'}});
    this.closeMenu();
  }

  goToHomePage(){
    if(window.location.pathname != '/'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/'],{state:{data:'home'}});
    this.closeMenu();
  }

  toDashboard(){
    if(window.location.pathname != '/dashboard'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/dashboard'],{state:{data:'dashboard'}});
    this.closeMenu();
  }

  toUpdateLog(){
    if(window.location.pathname != '/updatelog'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/updatelog'],{state:{data:'updatelog'}});
    this.closeMenu();
  }

  invoiceTracker(){
    if(window.location.pathname != '/invoicetracker'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/invoicetracker'],{state:{data:'invoicetracker'}});
    this.closeMenu();
  }

  createInvoice(){
    if(window.location.pathname != '/createinvoice'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/createinvoice'],{state:{data:'createinvoice'}});
    this.closeMenu();
  }

}
