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
    // console.log('On init',window,this.router,history.state);
    // console.log('RECIEVED',this.dashboardData);
    if(this.dashboardData && this.dashboardData == 'Y'){
      this.dashboard = true;
    }
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
    console.log('goToLoginPage',this);
    if(window.location.pathname != '/login'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/login'],{state:{data:'login'}});
    this.closeMenu();
  }

  goToHomePage(){
    console.log('goToHomePage',this);
    if(window.location.pathname != '/'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/'],{state:{data:'home'}});
    this.closeMenu();
  }

  toDashboard(){
    console.log('go to dashboard',this);
    if(window.location.pathname != '/dashboard'){
      this.elementRef.nativeElement.parentElement.remove();
    }
    this.router.navigate(['/dashboard'],{state:{data:'dashboard'}});
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
