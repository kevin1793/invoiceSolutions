import { Component, OnInit ,Input, ElementRef,Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  navOpened =  false;
  dashboard = false;
  @Output() currentFeature = new EventEmitter<string>();
  @Input() dashboardData: any;

  constructor(private router:Router,
    private elementRef: ElementRef) {
    }

    

  ngOnInit(): void {
    console.log('SIDE MENU ONINIT',window,this.router,history.state);
    if(this.dashboardData && this.dashboardData == 'Y'){
      this.dashboard = true;
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

  currentFeatureChange(value:string){
    console.log('before from child currentFeatureChange',value);
    this.currentFeature.emit(value);
  }

  closeMenu(){
    this.navOpened = false;
  }

  openMenu(){
    this.navOpened = true;
  }

  testfunc(){

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
    console.log('go to update Log',this);
    if(window.location.pathname != '/updatelog'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/updatelog'],{state:{data:'updatelog'}});
    this.closeMenu();
  }

  invoiceTracker(){
    // if(this.dashboard){
    //   this.currentFeatureChange('invoicetracker');
    //   this.closeMenu();
    //   return;
    // }
    console.log('go to invoice tracker',this);
    if(window.location.pathname != '/invoicetracker'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/invoicetracker'],{state:{data:'invoicetracker'}});
    this.closeMenu();
  }

  createInvoice(){
    // if(this.dashboard){
    //   this.currentFeatureChange('createinvoice');
    //   this.closeMenu();
    //   // console.log(this.currentFeature);
    //   return;
    // }
    console.log('go to createinvoice',this);
    if(window.location.pathname != '/createinvoice'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/createinvoice'],{state:{data:'createinvoice'}});
    this.closeMenu();
  }

}
