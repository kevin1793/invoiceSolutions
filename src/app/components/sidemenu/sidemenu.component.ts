import { Component, OnInit ,Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.css']
})
export class SidemenuComponent implements OnInit {
  navOpened =  false;
  dashboard = false;
  @Input() dashboardData: any;

  constructor(private router:Router,
    private elementRef: ElementRef) {
    }

    

  ngOnInit(): void {
    console.log('On init',window,this.router,history.state);
    console.log('RECIEVED',this.dashboardData);
    if(this.dashboardData && this.dashboardData == 'Y'){
      this.dashboard = true;
    }
  }

  closeMenu(){
    this.navOpened = false;
  }

  openMenu(){
    this.navOpened = true;
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

  createInvoice(){
    console.log('CREATE INVOICE CLICKED');
  }

}
